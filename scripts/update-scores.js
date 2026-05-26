const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL.replace('?sslmode=require', '').replace('?pgbouncer=true', ''),
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Mise a jour des scores...');
  const workflows = await prisma.workflow.findMany({ select: { id: true, title: true } });
  
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
  }
  
  console.log(`✅ ${workflows.length} scores mis a jour.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
