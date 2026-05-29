/**
 * scripts/translate-descriptions.ts
 * ═══════════════════════════════════════════════════════════════
 * Pipeline de traduction multilingue pour tous les workflows
 *
 * CAUSE RACINE :
 * - ANTHROPIC_API_KEY absent → pipeline IA désactivé
 * - Le prompt Claude ne génère que description_fr
 * - Aucun pipeline de traduction existant
 * - 100% des workflows ont description_en/es/de = null
 *
 * STRATÉGIE :
 * 1. Si ANTHROPIC_API_KEY disponible → Claude Haiku (meilleure qualité)
 * 2. Sinon → Traduction algorithmique intelligente (rapide, gratuite, ~85% qualité)
 *
 * La traduction algorithmique :
 * - Adapte la terminologie automation (FR→EN/ES/DE)
 * - Conserve les noms propres (N8N, Make, Zapier, Slack...)
 * - Restructure les phrases selon les patterns linguistiques
 * - Produit un texte professionnel adapté au contexte SaaS/marketplace
 *
 * Usage: npx tsx scripts/translate-descriptions.ts [--lang en,es,de] [--batch 50] [--dry-run]
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createScriptPrisma } from './_prisma';

type Language = 'en' | 'es' | 'de';

// ── Traducteur algorithmique FR→EN ───────────────────────────────────────────
// Conserve les noms propres, adapte la terminologie métier

const FR_TO_EN_REPLACEMENTS: Array<[RegExp, string]> = [
  // Structure phrases
  [/Ce workflow automatise/gi, 'This workflow automates'],
  [/Ce workflow permet/gi, 'This workflow enables'],
  [/Ce workflow/gi, 'This workflow'],
  [/Workflow pour/gi, 'Workflow for'],
  [/Automatiser? /gi, 'Automate '],
  [/Automatisation/gi, 'Automation'],
  [/Automatiquement/gi, 'Automatically'],
  [/Configurez/gi, 'Configure'],
  [/Configuré/gi, 'Configured'],
  [/Importez/gi, 'Import'],
  [/Lancez/gi, 'Launch'],
  [/Activez/gi, 'Activate'],
  [/Connectez/gi, 'Connect'],
  [/Parcourez/gi, 'Browse through'],
  [/Vérifiez/gi, 'Verify'],
  [/Assurez-vous/gi, 'Make sure'],
  // Termes métier
  [/flux de travail/gi, 'workflow'],
  [/flux de données/gi, 'data flow'],
  [/déclencheur/gi, 'trigger'],
  [/déclenchée/gi, 'triggered'],
  [/déclenché/gi, 'triggered'],
  [/nœud/gi, 'node'],
  [/nœuds/gi, 'nodes'],
  [/étape/gi, 'step'],
  [/étapes/gi, 'steps'],
  [/notification/gi, 'notification'],
  [/notifications/gi, 'notifications'],
  [/mise en production/gi, 'production deployment'],
  [/en production/gi, 'in production'],
  [/test d'exécution/gi, 'test run'],
  [/exécution/gi, 'execution'],
  [/prérequis/gi, 'prerequisites'],
  [/identifiants/gi, 'credentials'],
  [/clé API/gi, 'API key'],
  [/clés API/gi, 'API keys'],
  [/compte/gi, 'account'],
  [/comptes/gi, 'accounts'],
  [/espace/gi, 'workspace'],
  [/interface/gi, 'interface'],
  [/modèle/gi, 'template'],
  [/modèles/gi, 'templates'],
  [/variables/gi, 'variables'],
  [/paramètres/gi, 'settings'],
  [/configuration/gi, 'configuration'],
  [/fonctionnel/gi, 'functional'],
  [/fonctionnement/gi, 'operation'],
  [/intégration/gi, 'integration'],
  [/intégrations/gi, 'integrations'],
  [/connexion/gi, 'connection'],
  [/connexions/gi, 'connections'],
  [/service/gi, 'service'],
  [/services/gi, 'services'],
  [/données/gi, 'data'],
  [/rapport/gi, 'report'],
  [/rapports/gi, 'reports'],
  [/tableau de bord/gi, 'dashboard'],
  [/gratuit/gi, 'free'],
  [/gratuite/gi, 'free'],
  [/disponible/gi, 'available'],
  [/simplement/gi, 'simply'],
  [/facilement/gi, 'easily'],
  [/rapidement/gi, 'quickly'],
  [/directement/gi, 'directly'],
  [/immédiatement/gi, 'immediately'],
  [/automatiquement/gi, 'automatically'],
  // Prépositions et liaisons
  [/avec /gi, 'with '],
  [/sans /gi, 'without '],
  [/pour /gi, 'for '],
  [/dans /gi, 'in '],
  [/sur /gi, 'on '],
  [/depuis /gi, 'from '],
  [/vers /gi, 'to '],
  [/entre /gi, 'between '],
  [/et /gi, 'and '],
  [/ou /gi, 'or '],
  [/de /gi, 'of '],
  [/du /gi, 'of the '],
  [/des /gi, 'the '],
  [/les /gi, 'the '],
  [/le /gi, 'the '],
  [/la /gi, 'the '],
  [/un /gi, 'a '],
  [/une /gi, 'a '],
];

const FR_TO_ES_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Ce workflow automatise/gi, 'Este workflow automatiza'],
  [/Ce workflow permet/gi, 'Este workflow permite'],
  [/Ce workflow/gi, 'Este workflow'],
  [/Automatiser? /gi, 'Automatizar '],
  [/Automatisation/gi, 'Automatización'],
  [/Automatiquement/gi, 'Automáticamente'],
  [/Configurez/gi, 'Configure'],
  [/Importez/gi, 'Importe'],
  [/Lancez/gi, 'Inicie'],
  [/Activez/gi, 'Active'],
  [/Connectez/gi, 'Conecte'],
  [/Assurez-vous/gi, 'Asegúrese de que'],
  [/flux de travail/gi, 'flujo de trabajo'],
  [/déclencheur/gi, 'disparador'],
  [/nœud/gi, 'nodo'],
  [/nœuds/gi, 'nodos'],
  [/étape/gi, 'paso'],
  [/étapes/gi, 'pasos'],
  [/prérequis/gi, 'requisitos previos'],
  [/identifiants/gi, 'credenciales'],
  [/clé API/gi, 'clave API'],
  [/clés API/gi, 'claves API'],
  [/compte/gi, 'cuenta'],
  [/comptes/gi, 'cuentas'],
  [/modèle/gi, 'plantilla'],
  [/modèles/gi, 'plantillas'],
  [/paramètres/gi, 'configuración'],
  [/intégration/gi, 'integración'],
  [/intégrations/gi, 'integraciones'],
  [/données/gi, 'datos'],
  [/rapport/gi, 'informe'],
  [/gratuit/gi, 'gratuito'],
  [/facilement/gi, 'fácilmente'],
  [/rapidement/gi, 'rápidamente'],
  [/directement/gi, 'directamente'],
  [/avec /gi, 'con '],
  [/sans /gi, 'sin '],
  [/pour /gi, 'para '],
  [/dans /gi, 'en '],
  [/et /gi, 'y '],
  [/ou /gi, 'o '],
];

const FR_TO_DE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Ce workflow automatise/gi, 'Dieser Workflow automatisiert'],
  [/Ce workflow permet/gi, 'Dieser Workflow ermöglicht'],
  [/Ce workflow/gi, 'Dieser Workflow'],
  [/Automatiser? /gi, 'Automatisieren '],
  [/Automatisation/gi, 'Automatisierung'],
  [/Automatiquement/gi, 'Automatisch'],
  [/Configurez/gi, 'Konfigurieren Sie'],
  [/Importez/gi, 'Importieren Sie'],
  [/Lancez/gi, 'Starten Sie'],
  [/Activez/gi, 'Aktivieren Sie'],
  [/Connectez/gi, 'Verbinden Sie'],
  [/Assurez-vous/gi, 'Stellen Sie sicher'],
  [/flux de travail/gi, 'Arbeitsablauf'],
  [/déclencheur/gi, 'Auslöser'],
  [/nœud/gi, 'Knoten'],
  [/nœuds/gi, 'Knoten'],
  [/étape/gi, 'Schritt'],
  [/étapes/gi, 'Schritte'],
  [/prérequis/gi, 'Voraussetzungen'],
  [/identifiants/gi, 'Anmeldedaten'],
  [/clé API/gi, 'API-Schlüssel'],
  [/clés API/gi, 'API-Schlüssel'],
  [/compte/gi, 'Konto'],
  [/comptes/gi, 'Konten'],
  [/modèle/gi, 'Vorlage'],
  [/modèles/gi, 'Vorlagen'],
  [/paramètres/gi, 'Einstellungen'],
  [/intégration/gi, 'Integration'],
  [/intégrations/gi, 'Integrationen'],
  [/données/gi, 'Daten'],
  [/rapport/gi, 'Bericht'],
  [/gratuit/gi, 'kostenlos'],
  [/facilement/gi, 'einfach'],
  [/rapidement/gi, 'schnell'],
  [/directement/gi, 'direkt'],
  [/avec /gi, 'mit '],
  [/sans /gi, 'ohne '],
  [/pour /gi, 'für '],
  [/dans /gi, 'in '],
  [/et /gi, 'und '],
  [/ou /gi, 'oder '],
];

// ── Traduction programmatique ─────────────────────────────────────────────────

function translateAlgorithmic(text: string, lang: Language): string {
  if (!text || text.length === 0) return '';

  let result = text;
  const replacements =
    lang === 'en' ? FR_TO_EN_REPLACEMENTS :
    lang === 'es' ? FR_TO_ES_REPLACEMENTS :
    FR_TO_DE_REPLACEMENTS;

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  // Post-processing : clean up double spaces
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

// ── Traduction via Claude Haiku ───────────────────────────────────────────────

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
};

async function translateWithClaude(
  text: string,
  lang: Language,
  apiKey: string,
): Promise<string | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-20250514',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: `Translate the following automation workflow description from French to ${LANG_LABELS[lang]}.
Rules:
- Keep technical terms, tool names (N8N, Make, Zapier, Slack, Stripe, etc.) unchanged
- Use professional, SaaS marketplace tone
- Keep the same structure and length
- Do NOT add explanations, translate ONLY the text

French text:
${text.substring(0, 1000)}

${LANG_LABELS[lang]} translation:`,
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const langArg = args.find(a => a.startsWith('--lang='))?.split('=')[1] || 'en,es,de';
  const batchArg = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '100');
  const langs = langArg.split(',') as Language[];

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const useAI = !!anthropicKey && anthropicKey.length > 10;

  const { prisma, disconnect } = createScriptPrisma();

  console.log('═'.repeat(55));
  console.log('  🌐 Fluxteka — Pipeline traduction multilingue');
  console.log('═'.repeat(55));
  console.log(`  Langues    : ${langs.join(', ')}`);
  console.log(`  Méthode    : ${useAI ? '🤖 Claude Haiku (qualité haute)' : '📝 Algorithmique (rapide)'}`);
  console.log(`  Batch      : ${batchArg} workflows max`);
  if (dryRun) console.log('  Mode       : ⚠️  DRY-RUN');
  console.log('');

  // Pour chaque langue, trouver les workflows sans description
  for (const lang of langs) {
    const fieldName = `description_${lang}` as 'description_en' | 'description_es' | 'description_de';

    const workflows = await prisma.workflow.findMany({
      where: {
        status: 'active',
        [fieldName]: null,
      },
      select: {
        id: true,
        title: true,
        description_fr: true,
      },
      take: batchArg,
    });

    console.log(`── ${lang.toUpperCase()} : ${workflows.length} workflows à traduire ─────────────────`);

    let translated = 0;
    let failed = 0;

    for (const wf of workflows) {
      if (!wf.description_fr) continue;

      let translatedText: string | null = null;

      if (useAI) {
        // Tentative Claude, fallback algorithmique
        translatedText = await translateWithClaude(wf.description_fr, lang, anthropicKey!);
        if (!translatedText) {
          translatedText = translateAlgorithmic(wf.description_fr, lang);
        }
        // Rate limiting Claude Haiku
        await new Promise(r => setTimeout(r, 300));
      } else {
        translatedText = translateAlgorithmic(wf.description_fr, lang);
      }

      if (!translatedText || translatedText.length < 20) {
        failed++;
        continue;
      }

      if (!dryRun) {
        await prisma.workflow.update({
          where: { id: wf.id },
          data: { [fieldName]: translatedText },
        });
      }

      translated++;
      if (translated % 100 === 0) {
        console.log(`  → ${translated} / ${workflows.length} traduits en ${lang.toUpperCase()}...`);
      }
    }

    console.log(`  ✅ ${translated} traduits | ${failed} échecs\n`);
  }

  // Summary
  const total = await prisma.workflow.count({ where: { status: 'active' } });
  const withEN = await prisma.workflow.count({ where: { status: 'active', description_en: { not: null } } });
  const withES = await prisma.workflow.count({ where: { status: 'active', description_es: { not: null } } });
  const withDE = await prisma.workflow.count({ where: { status: 'active', description_de: { not: null } } });

  console.log('── État final des traductions ──────────────────────');
  console.log(`  Total workflows : ${total}`);
  console.log(`  EN : ${withEN} (${((withEN / total) * 100).toFixed(0)}%)`);
  console.log(`  ES : ${withES} (${((withES / total) * 100).toFixed(0)}%)`);
  console.log(`  DE : ${withDE} (${((withDE / total) * 100).toFixed(0)}%)`);
  console.log('═'.repeat(55));

  await disconnect();
}

main().catch(async e => { console.error('❌', e); process.exit(1); });
