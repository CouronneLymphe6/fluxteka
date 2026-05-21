import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const p = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }),
});

async function main() {
  const cats = await p.workflow.groupBy({
    by: ['category'],
    where: { status: 'active' },
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  });
  console.log('\n📊 Répartition par catégorie:');
  for (const c of cats) console.log(`  ${c.category}: ${c._count} workflows`);

  const tools = await p.workflow.groupBy({
    by: ['tool'],
    where: { status: 'active' },
    _count: true,
  });
  console.log('\n🔧 Par plateforme:');
  for (const t of tools) console.log(`  ${t.tool}: ${t._count}`);

  const total = await p.workflow.count({ where: { status: 'active' } });
  console.log(`\n📦 Total: ${total} workflows`);

  await p.$disconnect();
}

main();
