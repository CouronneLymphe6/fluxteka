import { createScriptPrisma } from './_prisma';
async function main() {
  const { prisma, disconnect } = createScriptPrisma();
  const wfs = await prisma.workflow.findFirst({ select: { description_fr: true, description_en: true, description_es: true, description_de: true } });
  console.log(wfs);
  await disconnect();
}
main().catch(console.error);
