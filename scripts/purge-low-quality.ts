/**
 * Purge low-quality workflows from the database and re-index with stricter criteria
 */
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const p = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }),
});

async function main() {
  console.log('🧹 Purging low-quality workflows...');

  // Count before
  const before = await p.workflow.count({ where: { status: 'active' } });
  console.log(`  Before: ${before} workflows`);

  // Remove workflows with < 100 views AND indexing_source = 'n8n-community'
  // Keep the 20 seed workflows (they have no indexing_source or different source)
  const lowQuality = await p.workflow.findMany({
    where: {
      status: 'active',
      indexing_source: 'n8n-community',
      source_views: { lt: 100 },
    },
    select: { id: true, slug: true, title: true, source_views: true },
  });

  console.log(`  Found ${lowQuality.length} low-quality workflows to remove`);

  for (const wf of lowQuality) {
    // Delete associated crawled URLs first
    await p.crawledUrl.deleteMany({ where: { workflow_id: wf.id } });
    await p.workflow.delete({ where: { id: wf.id } });
  }

  // Also remove workflows with very short descriptions (< 50 chars)
  const shortDesc = await p.workflow.findMany({
    where: {
      status: 'active',
      indexing_source: 'n8n-community',
      description_fr: { not: null },
    },
    select: { id: true, description_fr: true },
  });

  let shortRemoved = 0;
  for (const wf of shortDesc) {
    if ((wf.description_fr || '').length < 50) {
      await p.crawledUrl.deleteMany({ where: { workflow_id: wf.id } });
      await p.workflow.delete({ where: { id: wf.id } });
      shortRemoved++;
    }
  }

  console.log(`  Removed ${shortRemoved} short-description workflows`);

  const after = await p.workflow.count({ where: { status: 'active' } });
  console.log(`  After: ${after} workflows`);
  console.log(`  Removed: ${before - after} total`);

  await p.$disconnect();
}

main().catch(async (e) => { console.error(e); await p.$disconnect(); });
