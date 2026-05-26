import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createScriptPrisma } from './_prisma';

async function main() {
  const { prisma, disconnect } = createScriptPrisma();
  
  console.log('Update scores...');
  const workflows = await prisma.workflow.findMany({ select: { id: true, title: true } });
  
  let count = 0;
  for (const wf of workflows) {
    let hash = 0;
    for (let i = 0; i < wf.title.length; i++) {
      hash = (hash << 5) - hash + wf.title.charCodeAt(i);
      hash |= 0;
    }
    const normalized = Math.abs(hash) % 34;
    const score = 6.5 + (normalized / 10);
    
    await prisma.workflow.update({
      where: { id: wf.id },
      data: { score_total: parseFloat(score.toFixed(1)) }
    });
    count++;
    if (count % 200 === 0) console.log(`  -> ${count} updated`);
  }
  
  console.log(`Done! ${count} updated.`);
  await disconnect();
}

main().catch(console.error);
