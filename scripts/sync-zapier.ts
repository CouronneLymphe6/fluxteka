/**
 * scripts/sync-zapier.ts — Synchronisation Zapier via API officielle
 * Usage: npx tsx scripts/sync-zapier.ts [maxResults]
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { syncZapier } from '../lib/integrations/sync';

function createPrisma(): PrismaClient {
  const rawUrl = process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL ?? '';
  let cleanUrl = rawUrl;
  try {
    const u = new URL(rawUrl);
    u.searchParams.delete('sslmode');
    u.searchParams.delete('pgbouncer');
    cleanUrl = u.toString();
  } catch { /* use raw */ }

  const pool = new Pool({ connectionString: cleanUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function main() {
  const maxResults = parseInt(process.argv[2] || '2000');

  console.log('═'.repeat(52));
  console.log('  ⚡ Fluxteka — Sync Zapier (API officielle)');
  console.log('═'.repeat(52));
  console.log(`Max templates : ${maxResults}`);
  console.log(`Source        : zapier.com/api/v3/zap-templates`);
  console.log(`Auth          : Publique (aucune clé requise)`);

  const prisma = createPrisma();

  try {
    const result = await syncZapier(prisma as any, maxResults);

    console.log('\n' + '─'.repeat(52));
    console.log(`  ✅ Récupérés  : ${result.fetched}`);
    console.log(`  🆕 Nouveaux   : ${result.inserted}`);
    console.log(`  🔄 Mis à jour : ${result.updated}`);
    console.log(`  ⏭️  Ignorés    : ${result.skipped}`);
    console.log(`  ❌ Erreurs    : ${result.errors}`);

    const total = await (prisma as any).workflow.count({ where: { status: 'active' } });
    const zapierTotal = await (prisma as any).workflow.count({ where: { tool: 'zapier', status: 'active' } });
    console.log(`\n  📦 Zapier en base : ${zapierTotal}`);
    console.log(`  📦 Total en base  : ${total}`);
    console.log('═'.repeat(52));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error('❌', e); process.exit(1); });
