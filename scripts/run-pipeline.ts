/**
 * Pipeline Runner — Standalone script to crawl real workflows into SQLite
 *
 * Usage: npx tsx scripts/run-pipeline.ts [source] [maxResults]
 * Sources: n8n, make, zapier, all (default: n8n with 100)
 */

import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import slugifyLib from 'slugify';

// ── DB Setup ──
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

// ── Import crawlers directly (no @/ alias) ──
import { N8NCommunityWalker } from '../lib/pipeline/sources/n8n-community';
import { MakeTemplatesCrawler } from '../lib/pipeline/sources/make-templates';
import { ZapierTemplatesCrawler } from '../lib/pipeline/sources/zapier-templates';
import { ActivepiecesCrawler } from '../lib/pipeline/sources/activepieces';
import { PipedreamCrawler } from '../lib/pipeline/sources/pipedream';
import { FlowiseCrawler } from '../lib/pipeline/sources/flowise';
import type { CrawlerSource, RawWorkflow } from '../lib/pipeline/engine';

// ── Utils ──
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

function titleSimilarity(a: string, b: string): number {
  const na = a.toLowerCase(), nb = b.toLowerCase();
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  // Simple Levenshtein
  const m = na.length, n = nb.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = na[i - 1] === nb[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return 1 - dp[m][n] / maxLen;
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugifyLib(title, { lower: true, strict: true, locale: 'fr' }).substring(0, 80);
  let slug = base;
  let counter = 1;
  while (await prisma.workflow.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

function guessCategory(raw: RawWorkflow): string {
  const text = `${raw.title} ${raw.rawContent}`.toLowerCase();
  const map: [string[], string][] = [
    [['email', 'mail', 'smtp', 'newsletter', 'inbox', 'gmail', 'outlook', 'sendgrid'], 'email'],
    [['crm', 'hubspot', 'salesforce', 'pipedrive', 'lead', 'contact', 'deal'], 'crm'],
    [['blog', 'seo', 'content', 'article', 'wordpress', 'social', 'linkedin', 'twitter', 'post', 'publish', 'tiktok', 'instagram', 'youtube'], 'content'],
    [['data', 'analytics', 'dashboard', 'scraping', 'extract', 'csv', 'report', 'database'], 'data'],
    [['agent', 'ai', 'gpt', 'openai', 'claude', 'langchain', 'llm', 'chatbot', 'rag', 'gemini'], 'ai-agents'],
    [['shopify', 'ecommerce', 'woocommerce', 'product', 'order', 'cart', 'store'], 'ecommerce'],
    [['hr', 'recruit', 'cv', 'employee', 'onboarding', 'bamboo', 'hiring'], 'hr'],
    [['invoice', 'payment', 'stripe', 'billing', 'accounting', 'finance', 'bank', 'tax', 'expense'], 'finance'],
    [['devops', 'deploy', 'ci/cd', 'docker', 'kubernetes', 'github actions', 'monitoring'], 'devops'],
    [['marketing', 'campaign', 'ad', 'conversion', 'funnel', 'pixel'], 'marketing'],
    [['slack', 'discord', 'teams', 'notification', 'alert', 'message', 'chat', 'telegram'], 'email'],
  ];
  for (const [keywords, cat] of map) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return 'other';
}

// ── Sources ──
const SOURCES: Record<string, () => CrawlerSource> = {
  n8n:          () => new N8NCommunityWalker(),
  make:         () => new MakeTemplatesCrawler(),
  zapier:       () => new ZapierTemplatesCrawler(),
  activepieces: () => new ActivepiecesCrawler(),
  pipedream:    () => new PipedreamCrawler(),
  flowise:      () => new FlowiseCrawler(),
};

async function processWorkflows(source: CrawlerSource, maxResults: number) {
  console.log(`\n▶ Crawling ${source.name}...`);

  let rawWorkflows: RawWorkflow[];
  try {
    rawWorkflows = await source.crawl(maxResults);
    console.log(`  Trouvés: ${rawWorkflows.length}`);
  } catch (err) {
    console.error(`  ❌ Erreur crawl: ${err}`);
    return { found: 0, new: 0, dups: 0, errors: 1 };
  }

  // Ensure pipeline user
  let pipelineUserId: string;
  let user = await prisma.user.findFirst({ where: { email: 'pipeline@fluxteka.com' } });
  if (user) {
    pipelineUserId = user.id;
  } else {
    const created = await prisma.user.create({
      data: { email: 'pipeline@fluxteka.com', name: 'Fluxteka Pipeline', role: 'seller', email_verified: true },
    });
    pipelineUserId = created.id;
  }

  let newCount = 0, dupCount = 0, errCount = 0;

  for (const raw of rawWorkflows) {
    try {
      // Dedup by URL
      const normUrl = normalizeUrl(raw.url);
      const existingUrl = await prisma.crawledUrl.findFirst({ where: { url_normalized: normUrl } });
      if (existingUrl) { dupCount++; continue; }

      // Dedup by content
      const fp = contentFingerprint(raw.rawContent);
      const existingFp = await prisma.crawledUrl.findFirst({ where: { content_fingerprint: fp } });
      if (existingFp) { dupCount++; continue; }

      // Title similarity check
      const recent = await prisma.workflow.findMany({
        where: { status: 'active' },
        select: { id: true, title: true },
        take: 500,
        orderBy: { created_at: 'desc' },
      });
      let titleDup = false;
      for (const w of recent) {
        if (titleSimilarity(raw.title, w.title) > 0.85) { titleDup = true; break; }
      }
      if (titleDup) { dupCount++; continue; }

      // Extract data
      const tags = (raw.tags || []).map(t => t.toLowerCase()).slice(0, 10);
      const tools = (raw.tags || []).filter(t => t.length > 1).map(t => t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 10);
      const category = guessCategory(raw);
      const slug = await generateUniqueSlug(raw.title);

      // Insert
      const workflow = await prisma.workflow.create({
        data: {
          slug,
          title: raw.title.substring(0, 200),
          description_fr: raw.rawContent.substring(0, 2000),
          tool: raw.tool,
          tools_connected: JSON.stringify(tools),
          category,
          tags: JSON.stringify(tags),
          source_url: raw.url,
          source_type: raw.sourceType,
          source_stars: raw.sourceStars || 0,
          source_views: raw.sourceViews || 0,
          author_id: pipelineUserId,
          score_total: 6,
          raw_content: raw.rawContent.substring(0, 10000),
          indexing_source: source.name,
          status: 'active',
        },
      });

      await prisma.crawledUrl.create({
        data: {
          url: raw.url,
          url_normalized: normUrl,
          content_fingerprint: fp,
          source: source.name,
          workflow_id: workflow.id,
          status: 'indexed',
        },
      });

      newCount++;
    } catch (err) {
      errCount++;
      if (errCount <= 3) console.error(`  ❌ ${raw.title?.substring(0, 40)}: ${String(err).substring(0, 100)}`);
    }
  }

  console.log(`  ✅ ${newCount} nouveaux | ${dupCount} doublons | ${errCount} erreurs`);
  return { found: rawWorkflows.length, new: newCount, dups: dupCount, errors: errCount };
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const sourceName = args[0] || 'n8n';
  const maxResults = parseInt(args[1] || '100');

  console.log('═══════════════════════════════════════');
  console.log('  🚀 Fluxteka Pipeline Runner');
  console.log('═══════════════════════════════════════');
  console.log(`Sources: ${sourceName}`);
  console.log(`Max per source: ${maxResults}`);

  const sourceNames = sourceName === 'all' ? Object.keys(SOURCES) : sourceName.split(',').map(s => s.trim());

  let totalNew = 0, totalFound = 0;
  for (const name of sourceNames) {
    const factory = SOURCES[name];
    if (!factory) { console.warn(`⚠️ Source inconnue: "${name}"`); continue; }
    const result = await processWorkflows(factory(), maxResults);
    totalNew += result.new;
    totalFound += result.found;
  }

  const dbCount = await prisma.workflow.count({ where: { status: 'active' } });
  console.log('\n───────────────────────────────────────');
  console.log(`  Total trouvés: ${totalFound}`);
  console.log(`  Total nouveaux: ${totalNew}`);
  console.log(`  📦 Workflows en base: ${dbCount}`);
  console.log('═══════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error('❌', e); await prisma.$disconnect(); process.exit(1); });
