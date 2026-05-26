import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createScriptPrisma } from './_prisma';

async function main() {
  const { prisma, disconnect } = createScriptPrisma();
  
  const n8n = await prisma.workflow.findFirst({ where: { tool: 'n8n', raw_content: { not: null } } });
  console.log('--- N8N ---');
  console.log(n8n?.raw_content?.substring(0, 500));

  const ap = await prisma.workflow.findFirst({ where: { tool: 'activepieces', raw_content: { not: null } } });
  console.log('--- Activepieces ---');
  console.log(ap?.raw_content?.substring(0, 500));

  const pd = await prisma.workflow.findFirst({ where: { tool: 'pipedream', raw_content: { not: null } } });
  console.log('--- Pipedream ---');
  console.log(pd?.raw_content?.substring(0, 500));

  await disconnect();
}
main().catch(console.error);
