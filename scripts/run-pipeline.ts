/**
 * Pipeline Runner — Importe les workflows vers Supabase (production)
 *
 * Usage: npx tsx scripts/run-pipeline.ts [source] [maxResults]
 * Sources: n8n, all (default: n8n 500)
 *
 * Plateformes avec affiliation uniquement :
 *   - n8n      (referral)
 *   - zapier   → npx tsx scripts/sync-zapier.ts (nécessite partner ID)
 *   - make     → npx tsx scripts/sync-make.ts   (token configuré ✅)
 */

import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createScriptPrisma } from './_prisma';
import slugifyLib from 'slugify';
import { N8NCommunityWalker } from '../lib/pipeline/sources/n8n-community';
import type { CrawlerSource, RawWorkflow } from '../lib/pipeline/engine';

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'fbclid', 'gclid'].forEach(p => u.searchParams.delete(p));
    return u.origin + u.pathname.replace(/\/$/, '').toLowerCase();
  } catch { return url.toLowerCase().trim(); }
}

function contentFingerprint(rawContent: string): string {
  const normalized = rawContent.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim().substring(0, 1000);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function guessCategory(raw: RawWorkflow): string {
  const text = `${raw.title} ${raw.rawContent}`.toLowerCase();
  const map: [string[], string][] = [
    [['email', 'mail', 'smtp', 'newsletter', 'gmail', 'outlook', 'sendgrid'], 'communication'],
    [['crm', 'hubspot', 'salesforce', 'pipedrive', 'lead', 'contact', 'deal'], 'crm'],
    [['blog', 'seo', 'content', 'wordpress', 'social', 'linkedin', 'twitter', 'instagram'], 'marketing-content'],
    [['data', 'analytics', 'dashboard', 'scraping', 'extract', 'csv', 'report', 'database'], 'data-analytics'],
    [['agent', 'ai', 'gpt', 'openai', 'claude', 'langchain', 'llm', 'chatbot', 'gemini'], 'ai-agents'],
    [['shopify', 'ecommerce', 'woocommerce', 'product', 'order', 'cart'], 'ecommerce'],
    [['hr', 'recruit', 'employee', 'onboarding', 'hiring'], 'hr-recrutement'],
    [['invoice', 'payment', 'stripe', 'billing', 'finance', 'bank'], 'finance-admin'],
    [['github', 'deploy', 'ci', 'docker', 'devops', 'code', 'api'], 'dev-tech'],
    [['slack', 'discord', 'teams', 'notification', 'alert', 'telegram'], 'communication'],
    [['sales', 'prospect', 'outreach', 'cold'], 'sales-prospection'],
  ];
  for (const [keywords, cat] of map) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return 'operations';
}

async function generateUniqueSlug(prisma: any, title: string): Promise<string> {
  const base = slugifyLib(title, { lower: true, strict: true, locale: 'fr' }).substring(0, 80);
  let slug = base;
  let counter = 1;
  while (await prisma.workflow.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

const SOURCES: Record<string, () => CrawlerSource> = {
  n8n: () => new N8NCommunityWalker(),
};

async function processWorkflows(prisma: any, source: CrawlerSource, maxResults: number) {
  console.log(`\n▶ Crawling ${source.name}...`);
  let rawWorkflows: RawWorkflow[];
  try {
    rawWorkflows = await source.crawl(maxResults);
    console.log(`  Trouvés: ${rawWorkflows.length}`);
  } catch (err) {
    console.error(`  ❌ Erreur crawl: ${err}`);
    return { found: 0, new: 0, dups: 0, errors: 1 };
  }

  let pipelineUser = await prisma.user.findFirst({ where: { email: 'pipeline@fluxteka.com' } });
  if (!pipelineUser) {
    pipelineUser = await prisma.user.create({
      data: { email: 'pipeline@fluxteka.com', name: 'Fluxteka Pipeline', role: 'seller', email_verified: true },
    });
  }

  let newCount = 0, dupCount = 0, errCount = 0;

  for (const raw of rawWorkflows) {
    try {
      const normUrl = normalizeUrl(raw.url);
      if (await prisma.crawledUrl.findFirst({ where: { url_normalized: normUrl } })) { dupCount++; continue; }
      const fp = contentFingerprint(raw.rawContent);
      if (await prisma.crawledUrl.findFirst({ where: { content_fingerprint: fp } })) { dupCount++; continue; }

      const tags = (raw.tags || []).map((t: string) => t.toLowerCase()).slice(0, 10);
      const tools = (raw.tags || []).filter((t: string) => t.length > 1).map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 10);
      const slug = await generateUniqueSlug(prisma, raw.title);

      const workflow = await prisma.workflow.create({
        data: {
          slug,
          title: raw.title.substring(0, 200),
          description_fr: raw.rawContent.substring(0, 2000),
          tool: raw.tool,
          tools_connected: JSON.stringify(tools),
          category: guessCategory(raw),
          tags: JSON.stringify(tags),
          source_url: raw.url,
          source_type: raw.sourceType,
          source_stars: raw.sourceStars || 0,
          source_views: raw.sourceViews || 0,
          author_id: pipelineUser.id,
          score_total: 7,
          raw_content: raw.rawContent.substring(0, 10000),
          indexing_source: source.name,
          status: 'active',
        },
      });

      await prisma.crawledUrl.create({
        data: {
          url: raw.url, url_normalized: normUrl, content_fingerprint: fp,
          source: source.name, workflow_id: workflow.id, status: 'indexed',
        },
      });

      newCount++;
      if (newCount % 50 === 0) console.log(`  → ${newCount} indexés...`);
    } catch (err) {
      errCount++;
      if (errCount <= 3) console.error(`  ❌ ${raw.title?.substring(0, 40)}: ${String(err).substring(0, 100)}`);
    }
  }

  console.log(`  ✅ ${newCount} nouveaux | ${dupCount} doublons | ${errCount} erreurs`);
  return { found: rawWorkflows.length, new: newCount, dups: dupCount, errors: errCount };
}

async function main() {
  const args = process.argv.slice(2);
  const sourceName = args[0] || 'n8n';
  const maxResults = parseInt(args[1] || '500');

  console.log('═'.repeat(45));
  console.log('  🚀 Fluxteka Pipeline → Supabase');
  console.log('═'.repeat(45));
  console.log(`Source : ${sourceName} | Max : ${maxResults}\n`);

  const { prisma, disconnect } = createScriptPrisma();
  const sourceNames = sourceName === 'all' ? Object.keys(SOURCES) : sourceName.split(',').map(s => s.trim());

  let totalNew = 0, totalFound = 0;
  for (const name of sourceNames) {
    const factory = SOURCES[name];
    if (!factory) { console.warn(`⚠️  Source inconnue: "${name}" — utilise sync-make.ts ou sync-zapier.ts`); continue; }
    const result = await processWorkflows(prisma, factory(), maxResults);
    totalNew += result.new;
    totalFound += result.found;
  }

  const dbCount = await prisma.workflow.count({ where: { status: 'active' } });
  console.log('\n' + '─'.repeat(45));
  console.log(`  Total trouvés     : ${totalFound}`);
  console.log(`  Total nouveaux    : ${totalNew}`);
  console.log(`  📦 Total Supabase : ${dbCount} workflows`);
  console.log('═'.repeat(45));

  await disconnect();
}

main().catch(async e => { console.error('❌', e); process.exit(1); });
