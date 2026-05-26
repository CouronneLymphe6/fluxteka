/**
 * Activepieces Community Crawler — Indexe les pièces communautaires d'Activepieces
 *
 * Activepieces est open-source. Les pièces communautaires sont sur GitHub :
 * https://api.github.com/repos/activepieces/activepieces/contents/packages/pieces/community
 *
 * Chaque dossier = une pièce = un connecteur/outil.
 * On construit un "workflow" par intégration populaire :
 * ex. "Automatisation Slack avec Activepieces", "Gmail + Activepieces Flow"
 *
 * Stratégie :
 * 1. Liste tous les dossiers (pièces) via l'API GitHub
 * 2. Pour chaque pièce, lit le package.json pour nom, description, et métadonnées
 * 3. Génère un RawWorkflow par pièce avec contexte automation
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO = 'activepieces/activepieces';
const COMMUNITY_PATH = 'packages/pieces/community';

// Catégories connues des pièces Activepieces (basées sur leur GitHub)
const PIECE_CATEGORIES: Record<string, string> = {
  gmail: 'communication', slack: 'communication', discord: 'communication',
  telegram: 'communication', whatsapp: 'communication', twilio: 'communication',
  hubspot: 'crm', salesforce: 'crm', pipedrive: 'crm',
  airtable: 'data', notion: 'data', 'google-sheets': 'data',
  shopify: 'ecommerce', woocommerce: 'ecommerce', stripe: 'finance',
  openai: 'ai', anthropic: 'ai', 'google-gemini': 'ai', replicate: 'ai',
  github: 'devops', gitlab: 'devops', jira: 'devops', linear: 'devops',
  mailchimp: 'marketing', sendgrid: 'marketing', brevo: 'marketing',
  wordpress: 'content', webflow: 'content', ghost: 'content',
};

interface GitHubContent {
  name: string;
  path: string;
  type: 'dir' | 'file';
  html_url: string;
  download_url?: string;
}

interface PiecePackageJson {
  name?: string;
  displayName?: string;
  description?: string;
  version?: string;
  keywords?: string[];
}

/** Transforme un nom de dossier en label lisible */
function toLabel(dirName: string): string {
  return dirName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Détermine les outils connectés depuis le nom de la pièce */
function extractToolsFromPiece(pieceName: string, description: string): string[] {
  const tools: string[] = [toLabel(pieceName)];
  const text = `${pieceName} ${description}`.toLowerCase();

  const knownTools: Record<string, string> = {
    gmail: 'Gmail', slack: 'Slack', discord: 'Discord', telegram: 'Telegram',
    hubspot: 'HubSpot', salesforce: 'Salesforce', notion: 'Notion',
    airtable: 'Airtable', stripe: 'Stripe', shopify: 'Shopify',
    openai: 'OpenAI', anthropic: 'Anthropic', github: 'GitHub',
    jira: 'Jira', mailchimp: 'Mailchimp', sendgrid: 'SendGrid',
    'google-sheets': 'Google Sheets', sheets: 'Google Sheets',
    whatsapp: 'WhatsApp', twilio: 'Twilio', pipedrive: 'Pipedrive',
  };

  for (const [key, label] of Object.entries(knownTools)) {
    if (text.includes(key) && !tools.includes(label)) {
      tools.push(label);
    }
  }

  return tools.slice(0, 8);
}

export class ActivepiecesCrawler implements CrawlerSource {
  name = 'activepieces-community';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const results: RawWorkflow[] = [];
    const headers: Record<string, string> = {
      'User-Agent': 'Fluxteka/1.0',
      'Accept': 'application/vnd.github.v3+json',
    };

    // Ajouter token si disponible pour éviter le rate-limiting
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Liste tous les dossiers de pièces communautaires
    let pieces: GitHubContent[] = [];
    try {
      const listRes = await fetch(
        `${GITHUB_API_BASE}/repos/${REPO}/contents/${COMMUNITY_PATH}`,
        { headers }
      );

      if (!listRes.ok) {
        console.error(`[Activepieces] GitHub API error: ${listRes.status} ${listRes.statusText}`);
        return [];
      }

      const data: GitHubContent[] = await listRes.json();
      pieces = data.filter(item => item.type === 'dir');
      console.log(`[Activepieces] ${pieces.length} pièces communautaires trouvées`);
    } catch (err) {
      console.error(`[Activepieces] Erreur liste GitHub: ${err}`);
      return [];
    }

    // 2. Pour chaque pièce, récupérer son package.json
    const toProcess = pieces.slice(0, maxResults);

    for (const piece of toProcess) {
      if (results.length >= maxResults) break;

      try {
        // Tentative de lecture du package.json
        const pkgUrl = `${GITHUB_API_BASE}/repos/${REPO}/contents/${piece.path}/package.json`;
        const pkgRes = await fetch(pkgUrl, { headers });

        let pkgData: PiecePackageJson = {};
        if (pkgRes.ok) {
          const pkgRaw = await pkgRes.json();
          // Le contenu est encodé en base64
          if (pkgRaw.content) {
            try {
              const decoded = Buffer.from(pkgRaw.content, 'base64').toString('utf-8');
              pkgData = JSON.parse(decoded);
            } catch {
              // Ignore JSON parse errors
            }
          }
        }

        const pieceName = piece.name;
        const displayName = pkgData.displayName || toLabel(pieceName);
        const description = pkgData.description || `Connecteur ${displayName} pour Activepieces`;
        const keywords = pkgData.keywords || [];
        const version = pkgData.version || '1.0.0';

        // Construire un titre de workflow exploitable
        const title = `Automatisation ${displayName} avec Activepieces`;

        // URL de la pièce sur GitHub
        const url = `https://github.com/${REPO}/tree/main/${piece.path}`;

        // Outils connectés
        const tools = extractToolsFromPiece(pieceName, description);

        // Tags : nom de la pièce + mots-clés du package
        const tags = [
          pieceName.toLowerCase(),
          'activepieces',
          'automation',
          'no-code',
          ...keywords.map((k: string) => k.toLowerCase()),
        ].slice(0, 10);

        // Catégorie
        const category = PIECE_CATEGORIES[pieceName] ||
          (description.toLowerCase().includes('ai') ? 'ai' : 'operations');

        // Contenu brut enrichi
        const rawContent = [
          `Platform: Activepieces`,
          `Piece: ${displayName}`,
          `Version: ${version}`,
          `Description: ${description}`,
          `Category: ${category}`,
          `Connected Tools: ${tools.join(', ')}`,
          `Keywords: ${keywords.join(', ')}`,
          ``,
          `${displayName} est une pièce communautaire Activepieces permettant d'automatiser vos processus avec ${displayName}.`,
          ``,
          `Activepieces est une plateforme d'automatisation open-source et self-hostable, alternative à Zapier et Make.`,
          `Cette pièce permet de connecter ${displayName} à vos autres outils et de créer des workflows automatisés sans coder.`,
          ``,
          `Cas d'usage : automatisation de tâches répétitives, synchronisation de données, notifications, déclencheurs d'événements.`,
        ].join('\n');

        results.push({
          url,
          title,
          rawContent,
          tool: 'activepieces',
          sourceType: 'activepieces-community',
          sourceStars: 0,
          sourceViews: 0,
          author: 'activepieces-community',
          authorUrl: `https://github.com/${REPO}`,
          tags,
        });

        // Petite pause pour respecter le rate limit GitHub (60 req/h sans token)
        await new Promise(r => setTimeout(r, process.env.GITHUB_TOKEN ? 100 : 1200));
      } catch (err) {
        console.warn(`[Activepieces] Erreur pièce "${piece.name}": ${err}`);
      }
    }

    console.log(`[Activepieces] ${results.length} workflows générés`);
    return results;
  }
}
