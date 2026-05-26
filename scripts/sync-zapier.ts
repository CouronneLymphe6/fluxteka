/**
 * scripts/sync-zapier.ts — Synchronisation Zapier via API officielle
 * Usage: npx tsx scripts/sync-zapier.ts [maxResults]
 *
 * Aucune clé API requise — API publique Zapier.
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { syncZapier } from '../lib/integrations/sync';

async function main() {
  const maxResults = parseInt(process.argv[2] || '2000');

  console.log('═'.repeat(52));
  console.log('  ⚡ Fluxteka — Sync Zapier (API officielle)');
  console.log('═'.repeat(52));
  console.log(`Max templates : ${maxResults}`);
  console.log(`Source        : api.zapier.com/v3/zap-templates`);
  console.log(`Auth          : Publique (aucune clé requise)`);

  const prisma = new PrismaClient();

  try {
    const result = await syncZapier(prisma, maxResults);

    console.log('\n' + '─'.repeat(52));
    console.log(`  ✅ Récupérés  : ${result.fetched}`);
    console.log(`  🆕 Nouveaux   : ${result.inserted}`);
    console.log(`  🔄 Mis à jour : ${result.updated}`);
    console.log(`  ⏭️  Ignorés    : ${result.skipped}`);
    console.log(`  ❌ Erreurs    : ${result.errors}`);

    const total = await prisma.workflow.count({ where: { status: 'active' } });
    const zapierTotal = await prisma.workflow.count({ where: { tool: 'zapier', status: 'active' } });
    console.log(`\n  📦 Zapier en base : ${zapierTotal} workflows`);
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
