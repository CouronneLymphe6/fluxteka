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
import { syncMake } from '../lib/integrations/sync';

async function main() {
  const maxResults = parseInt(process.argv[2] || '1500');

  console.log('═'.repeat(52));
  console.log('  🟣 Fluxteka — Sync Make (API officielle)');
  console.log('═'.repeat(52));
  console.log(`Max templates : ${maxResults}`);
  console.log(`Région        : ${process.env.MAKE_API_REGION || 'EU (eu1.make.com)'}`);
  console.log(`Token         : ${process.env.MAKE_API_TOKEN ? '✅ configuré' : '❌ MAKE_API_TOKEN manquant!'}`);

  if (!process.env.MAKE_API_TOKEN) {
    console.log('\n⚠️  Pour obtenir ton token Make :');
    console.log('   1. Va sur make.com → Profil → API');
    console.log('   2. Clique sur "Générer un token"');
    console.log('   3. Ajoute MAKE_API_TOKEN=xxx dans .env.local');
    console.log('   4. Relance ce script\n');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const result = await syncMake(prisma, maxResults);

    console.log('\n' + '─'.repeat(52));
    console.log(`  ✅ Récupérés  : ${result.fetched}`);
    console.log(`  🆕 Nouveaux   : ${result.inserted}`);
    console.log(`  🔄 Mis à jour : ${result.updated}`);
    console.log(`  ⏭️  Ignorés    : ${result.skipped}`);
    console.log(`  ❌ Erreurs    : ${result.errors}`);

    const total = await prisma.workflow.count({ where: { status: 'active' } });
    const makeTotal = await prisma.workflow.count({ where: { tool: 'make', status: 'active' } });
    console.log(`\n  📦 Make en base   : ${makeTotal} workflows`);
    console.log(`  📦 Total en base  : ${total} workflows`);
    console.log('═'.repeat(52));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async e => {
  console.error('❌ Erreur fatale:', e);
  process.exit(1);
});
