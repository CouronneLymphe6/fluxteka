import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createScriptPrisma } from './_prisma';

const SOURCES_TO_DELETE = ['flowise', 'pipedream', 'langchain', 'activepieces'];

async function main() {
  const { prisma, disconnect } = createScriptPrisma();

  console.log('═'.repeat(52));
  console.log('  🗑️  Fluxteka — Nettoyage sources sans affiliation');
  console.log('═'.repeat(52));
  console.log(`Sources à supprimer : ${SOURCES_TO_DELETE.join(', ')}`);

  const before = await prisma.workflow.count({ where: { status: 'active' } });
  console.log(`\nWorkflows avant : ${before}`);

  for (const tool of SOURCES_TO_DELETE) {
    // Récupérer les IDs
    const workflows = await prisma.workflow.findMany({
      where: { tool, status: 'active' },
      select: { id: true },
    });

    const ids = workflows.map((w: any) => w.id);
    if (ids.length === 0) {
      console.log(`  ⏭️  ${tool} : 0 workflows (déjà vide)`);
      continue;
    }

    // Supprimer les crawledUrls liés
    const deletedUrls = await prisma.crawledUrl.deleteMany({
      where: { workflow_id: { in: ids } },
    });

    // Supprimer les workflows
    const deletedWf = await prisma.workflow.deleteMany({
      where: { id: { in: ids } },
    });

    console.log(`  🗑️  ${tool} : ${deletedWf.count} workflows supprimés (${deletedUrls.count} URLs)`);
  }

  const after = await prisma.workflow.count({ where: { status: 'active' } });
  console.log(`\n  📦 Avant : ${before} → Après : ${after} workflows`);
  console.log('═'.repeat(52));

  await disconnect();
}

main().catch(async e => { console.error('❌', e); process.exit(1); });
