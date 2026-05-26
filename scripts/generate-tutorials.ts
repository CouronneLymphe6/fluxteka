import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createScriptPrisma } from './_prisma';

function generateTutorial(tool: string, title: string, toolsConnected: string[] = []): string {
  const platformName = tool.charAt(0).toUpperCase() + tool.slice(1);
  
  // Format the connected tools logically
  let connectionsText = '';
  if (toolsConnected && toolsConnected.length > 0) {
    const uniqueTools = Array.from(new Set(toolsConnected.filter(t => t.toLowerCase() !== tool.toLowerCase())));
    
    if (uniqueTools.length === 1) {
      connectionsText = `- Authentifiez votre compte **${uniqueTools[0]}** dans le nœud correspondant.`;
    } else if (uniqueTools.length > 1) {
      connectionsText = uniqueTools.map(t => `- Configurez les identifiants pour **${t}**.`).join('\n   ');
    }
  }

  // Si on a des outils connectés précis
  if (connectionsText) {
    return `### Guide de déploiement rapide

1. **Prérequis** : Assurez-vous d'avoir accès à votre espace **${platformName}** ainsi qu'aux outils tiers requis.
2. **Importation** : Copiez ou importez ce modèle directement dans votre interface ${platformName}.
3. **Connexions requises** :
   ${connectionsText}
4. **Configuration** : Parcourez les nœuds du workflow pour vérifier les champs obligatoires (ex: adresses email, IDs de dossiers).
5. **Test & Activation** : Lancez une exécution de test pour valider le flux, puis activez-le en production.`;
  }

  // Tutoriel générique si pas d'outils connectés précis (ex: outils internes ou utilitaires)
  return `### Guide de déploiement rapide

1. **Importation** : Importez ce workflow dans votre espace **${platformName}**.
2. **Configuration** : Parcourez les étapes du workflow. Adaptez les variables et les paramètres selon votre cas d'usage.
3. **Test & Activation** : Lancez une exécution manuelle pour vérifier le bon fonctionnement du flux.
4. **Mise en production** : Une fois le test validé, vous pouvez activer le workflow.`;
}

async function main() {
  const { prisma, disconnect } = createScriptPrisma();
  
  const workflows = await prisma.workflow.findMany({
    where: {
      how_to_use: null,
    },
    select: { id: true, title: true, tool: true, tools_connected: true },
  });

  console.log(`🚀 Lancement de la génération programmatique pour ${workflows.length} workflows...`);

  let successCount = 0;

  for (const wf of workflows) {
    let connectedTools: string[] = [];
    try {
      if (typeof wf.tools_connected === 'string') {
        connectedTools = JSON.parse(wf.tools_connected);
      } else if (Array.isArray(wf.tools_connected)) {
        connectedTools = wf.tools_connected;
      }
    } catch (e) {
      // ignore
    }

    const tutorial = generateTutorial(wf.tool, wf.title, connectedTools);

    await prisma.workflow.update({
      where: { id: wf.id },
      data: { how_to_use: tutorial },
    });

    successCount++;
    if (successCount % 100 === 0) {
      console.log(`✅ ${successCount} tutoriels générés...`);
    }
  }

  console.log(`\n🎉 Terminé ! ${successCount} tutoriels générés algorithmiquement et sans coûts d'API.`);
  await disconnect();
}

main().catch(console.error);
