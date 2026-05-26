/**
 * scripts/sync-make.ts — Synchronisation Make via API officielle REST v2
 * Usage: npx tsx scripts/sync-make.ts [maxResults]
 *
 * Requiert : MAKE_API_TOKEN dans .env.local
 * Obtenir  : make.com → Profil → API → Générer un token
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { syncMake } from '../lib/integrations/sync';

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
  const maxResults = parseInt(process.argv[2] || '1500');

  console.log('═'.repeat(52));
  console.log('  🟣 Fluxteka — Sync Make (API officielle)');
  console.log('═'.repeat(52));
  console.log(`Max templates : ${maxResults}`);
  console.log(`Région        : ${process.env.MAKE_API_REGION || 'EU (eu1.make.com)'}`);
  console.log(`Token         : ${process.env.MAKE_API_TOKEN ? '✅ configuré' : '❌ MAKE_API_TOKEN manquant'}`);

  if (!process.env.MAKE_API_TOKEN) {
    console.log('\n⚠️  Pour obtenir ton token Make :');
    console.log('   1. Va sur make.com → ton avatar → Profil');
    console.log('   2. Onglet "API" → "Ajouter un token"');
    console.log('   3. Nomme-le "Fluxteka" → Ajouter');
    console.log('   4. Copie le token');
    console.log('   5. Ajoute MAKE_API_TOKEN=xxx dans .env.local\n');
    process.exit(1);
  }

  const prisma = createPrisma();

  try {
    const result = await syncMake(prisma as any, maxResults);

    console.log('\n' + '─'.repeat(52));
    console.log(`  ✅ Récupérés  : ${result.fetched}`);
    console.log(`  🆕 Nouveaux   : ${result.inserted}`);
    console.log(`  🔄 Mis à jour : ${result.updated}`);
    console.log(`  ⏭️  Ignorés    : ${result.skipped}`);
    console.log(`  ❌ Erreurs    : ${result.errors}`);

    const total = await (prisma as any).workflow.count({ where: { status: 'active' } });
    const makeTotal = await (prisma as any).workflow.count({ where: { tool: 'make', status: 'active' } });
    console.log(`\n  📦 Make en base   : ${makeTotal}`);
    console.log(`  📦 Total en base  : ${total}`);
    console.log('═'.repeat(52));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error('❌', e); process.exit(1); });
