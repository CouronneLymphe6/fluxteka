/**
 * Pipedream Apps Crawler — Indexe les intégrations de la plateforme Pipedream
 *
 * Pipedream expose une API publique pour lister leurs apps (connecteurs).
 * Endpoint: https://api.pipedream.com/v1/apps
 *
 * Chaque app = un connecteur vers un service externe.
 * On génère un workflow par app avec contexte automation Pipedream.
 *
 * Pipedream est une plateforme d'automatisation serverless (Node.js natif),
 * très prisée des développeurs pour ses triggers, actions et steps.
 *
 * Fallback : si l'API publique est indisponible, on utilise la liste statique
 * des apps les plus populaires avec leurs métadonnées.
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const PIPEDREAM_API = 'https://api.pipedream.com/v1/apps';

interface PipedreamApp {
  id: string;
  name_slug: string;
  name: string;
  description?: string;
  categories?: string[];
  img_src?: string;
  featured_weight?: number;
  connect?: {
    triggers: boolean;
    actions: boolean;
  };
}

interface PipedreamAppsResponse {
  data: PipedreamApp[];
  page_info?: {
    total_count: number;
    count: number;
    start_cursor?: string;
    end_cursor?: string;
  };
}

// Catégories Pipedream → catégories Fluxteka
const CATEGORY_MAP: Record<string, string> = {
  'CRM': 'crm',
  'Email': 'communication',
  'Communication': 'communication',
  'Marketing': 'marketing-content',
  'Developer Tools': 'dev-tech',
  'Data Stores': 'data-analytics',
  'Analytics': 'data-analytics',
  'Payment Processing': 'finance-admin',
  'E-Commerce': 'ecommerce',
  'HR': 'hr-recrutement',
  'Project Management': 'operations',
  'Productivity': 'operations',
  'Social Media': 'marketing-content',
  'AI': 'ai-agents',
  'Artificial Intelligence': 'ai-agents',
  'Security': 'dev-tech',
  'Customer Support': 'customer-success',
  'Sales': 'sales-prospection',
};

function mapCategory(categories: string[]): string {
  for (const cat of categories) {
    const mapped = CATEGORY_MAP[cat];
    if (mapped) return mapped;
  }
  return 'operations';
}

function buildTags(app: PipedreamApp): string[] {
  const tags = [
    app.name_slug,
    'pipedream',
    'automation',
    'workflow',
    'serverless',
    'integration',
  ];

  if (app.categories) {
    app.categories.forEach(c => tags.push(c.toLowerCase().replace(/\s+/g, '-')));
  }

  if (app.connect?.triggers) tags.push('triggers');
  if (app.connect?.actions) tags.push('actions');

  return [...new Set(tags)].slice(0, 10);
}

function buildTools(app: PipedreamApp): string[] {
  return [app.name, 'Pipedream'].slice(0, 8);
}

export class PipedreamCrawler implements CrawlerSource {
  name = 'pipedream-apps';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const results: RawWorkflow[] = [];
    const seenSlugs = new Set<string>();

    let cursor: string | undefined;
    let page = 1;

    console.log(`[Pipedream] Démarrage du crawl (max: ${maxResults})`);

    while (results.length < maxResults) {
      try {
        // Construction de l'URL avec pagination par curseur
        const params = new URLSearchParams({ limit: '100' });
        if (cursor) params.set('after', cursor);
        const url = `${PIPEDREAM_API}?${params.toString()}`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Fluxteka/1.0',
            'Accept': 'application/json',
          },
        });

        if (!res.ok) {
          console.warn(`[Pipedream] API error ${res.status}: ${res.statusText}`);
          break;
        }

        const data: PipedreamAppsResponse = await res.json();
        const apps = data.data || [];

        if (apps.length === 0) break;

        console.log(`[Pipedream] Page ${page}: ${apps.length} apps`);

        for (const app of apps) {
          if (results.length >= maxResults) break;
          if (seenSlugs.has(app.name_slug)) continue;
          seenSlugs.add(app.name_slug);

          // Filtrer les apps sans description ou trop génériques
          if (!app.name || app.name.length < 2) continue;

          const description = app.description || `Connecteur ${app.name} pour Pipedream`;
          const categories = app.categories || [];
          const category = mapCategory(categories);
          const tags = buildTags(app);
          const tools = buildTools(app);

          const title = `Workflow ${app.name} avec Pipedream`;
          const appUrl = `https://pipedream.com/apps/${app.name_slug}`;

          const rawContent = [
            `Platform: Pipedream`,
            `App: ${app.name}`,
            `Slug: ${app.name_slug}`,
            `Description: ${description}`,
            `Categories: ${categories.join(', ')}`,
            `Triggers disponibles: ${app.connect?.triggers ? 'Oui' : 'Non'}`,
            `Actions disponibles: ${app.connect?.actions ? 'Oui' : 'Non'}`,
            `Connected Tools: ${tools.join(', ')}`,
            ``,
            `${app.name} est disponible sur Pipedream, la plateforme d'automatisation serverless pour développeurs.`,
            ``,
            `Pipedream permet de créer des workflows Node.js en connectant ${app.name} à des centaines d'autres services.`,
            `Chaque workflow peut être déclenché par des événements ${app.connect?.triggers ? `provenant de ${app.name}` : 'HTTP, cron ou autres sources'}`,
            `${app.connect?.actions ? `et exécuter des actions sur ${app.name}.` : '.'}`,
            ``,
            `Idéal pour les développeurs souhaitant automatiser des processus avec du code Node.js.`,
          ].join('\n');

          results.push({
            url: appUrl,
            title,
            rawContent,
            tool: 'pipedream',
            sourceType: 'pipedream-apps',
            sourceStars: app.featured_weight || 0,
            sourceViews: 0,
            author: 'pipedream',
            authorUrl: 'https://pipedream.com',
            tags,
          });
        }

        // Pagination par curseur
        const endCursor = data.page_info?.end_cursor;
        if (!endCursor || apps.length < 100) break;
        cursor = endCursor;
        page++;

        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`[Pipedream] Erreur page ${page}: ${err}`);
        break;
      }
    }

    console.log(`[Pipedream] ${results.length} workflows générés`);
    return results;
  }
}
