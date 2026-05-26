/**
 * Scraper Activepieces — Point d'entrée standalone
 *
 * Usage: npx tsx scripts/scrape-activepieces.ts [maxResults]
 *
 * Crawle les pièces communautaires Activepieces depuis GitHub
 * et les insère en base de données.
 *
 * Source: https://api.github.com/repos/activepieces/activepieces/contents/packages/pieces/community
 *
 * Prérequis :
 * - DATABASE_URL dans .env.local
 * - GITHUB_TOKEN dans .env.local (optionnel mais recommandé pour éviter le rate-limit)
 */

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { ActivepiecesCrawler } from '../lib/pipeline/sources/activepieces';
import crypto from 'crypto';
import slugifyLib from 'slugify';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref'].forEach(p => u.searchParams.delete(p));
    return u.origin + u.pathname.replace(/\/$/, '').toLowerCase();
  } catch { return url.toLowerCase().trim(); }
}

function contentFingerprint(content: string): string {
  const normalized = content.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim().substring(0, 1000);
  return crypto.createHash('sha256').update(normalized).digest('hex');
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

async function main() {
  const args = process.argv.slice(2);
  const maxResults = parseInt(args[0] || '100');

  console.log('═'.repeat(50));
  console.log('  🧩 Fluxteka — Scraper Activepieces');
  console.log('═'.repeat(50));
  console.log(`Max résultats: ${maxResults}`);
  console.log(`GitHub Token: ${process.env.GITHUB_TOKEN ? '✅ présent' : '⚠️  absent'}`);

  // Pipeline user
  let pipelineUser = await prisma.user.findFirst({ where: { email: 'pipeline@fluxteka.com' } });
  if (!pipelineUser) {
    pipelineUser = await prisma.user.create({
      data: { email: 'pipeline@fluxteka.com', name: 'Fluxteka Pipeline', role: 'seller', email_verified: true },
    });
  }

  const crawler = new ActivepiecesCrawler();
  const rawWorkflows = await crawler.crawl(maxResults);

  console.log(`\nTrouvés: ${rawWorkflows.length}`);

  let newCount = 0, dupCount = 0, errCount = 0;

  for (const raw of rawWorkflows) {
    try {
      const normUrl = normalizeUrl(raw.url);
      const existing = await prisma.crawledUrl.findFirst({ where: { url_normalized: normUrl } });
      if (existing) { dupCount++; continue; }

      const fp = contentFingerprint(raw.rawContent);
      const existingFp = await prisma.crawledUrl.findFirst({ where: { content_fingerprint: fp } });
      if (existingFp) { dupCount++; continue; }

      const slug = await generateUniqueSlug(raw.title);
      const tags = (raw.tags || []).slice(0, 10);
      const tools = (raw.tags || []).filter(t => t.length > 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 8);

      const workflow = await prisma.workflow.create({
        data: {
          slug,
          title: raw.title.substring(0, 200),
          description_fr: raw.rawContent.substring(0, 2000),
          tool: raw.tool,
          tools_connected: JSON.stringify(tools),
          category: 'operations',
          tags: JSON.stringify(tags),
          source_url: raw.url,
          source_type: raw.sourceType,
          source_stars: raw.sourceStars || 0,
          source_views: raw.sourceViews || 0,
          author_id: pipelineUser.id,
          score_total: 6,
          raw_content: raw.rawContent.substring(0, 10000),
          indexing_source: 'activepieces-community',
          status: 'active',
        },
      });

      await prisma.crawledUrl.create({
        data: {
          url: raw.url,
          url_normalized: normUrl,
          content_fingerprint: fp,
          source: 'activepieces-community',
          workflow_id: workflow.id,
          status: 'indexed',
        },
      });

      newCount++;
      if (newCount % 10 === 0) console.log(`  → ${newCount} indexés...`);
    } catch (err) {
      errCount++;
      if (errCount <= 3) console.error(`  ❌ ${raw.title?.substring(0, 40)}: ${String(err).substring(0, 100)}`);
    }
  }

  const total = await prisma.workflow.count({ where: { status: 'active' } });
  console.log('\n───────────────────────────────────────');
  console.log(`  ✅ ${newCount} nouveaux | ${dupCount} doublons | ${errCount} erreurs`);
  console.log(`  📦 Total en base: ${total} workflows`);
  console.log('═'.repeat(50));

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error('❌', e); await prisma.$disconnect(); process.exit(1); });
