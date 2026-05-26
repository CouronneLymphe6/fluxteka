/**
 * Zapier Templates Crawler
 * Source: API publique Zapier (sans auth pour les templates publics)
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const ZAPIER_API = 'https://zapier.com/api/v3/zap-templates/';

interface ZapierTemplate {
  id: number;
  title: string;
  description_plain: string;
  description_raw?: string;
  slug: string;
  status: string;
  url: string;
  steps: Array<{ app: { name: string; slug: string; category_label: string } }>;
  creates_count?: number;
  type: string;
}

interface ZapierResponse {
  objects: ZapierTemplate[];
  meta: { total_count: number; limit: number; offset: number };
}

const CATEGORY_HINTS: Record<string, string> = {
  'email': 'communication', 'gmail': 'communication', 'mailchimp': 'marketing-content',
  'slack': 'communication', 'teams': 'communication', 'discord': 'communication',
  'crm': 'crm', 'salesforce': 'crm', 'hubspot': 'crm', 'pipedrive': 'crm',
  'google-sheets': 'data-analytics', 'airtable': 'data-analytics', 'notion': 'operations',
  'stripe': 'finance-admin', 'paypal': 'finance-admin', 'shopify': 'ecommerce',
  'openai': 'ai-agents', 'chatgpt': 'ai-agents', 'claude': 'ai-agents',
  'twitter': 'marketing-content', 'instagram': 'marketing-content', 'linkedin': 'marketing-content',
  'github': 'dev-tech', 'jira': 'dev-tech', 'trello': 'operations',
  'figma': 'dev-tech', 'asana': 'operations', 'monday': 'operations',
};

function mapCategory(steps: ZapierTemplate['steps']): string {
  for (const step of steps) {
    const slug = step.app?.slug?.toLowerCase() || '';
    const cat = step.app?.category_label?.toLowerCase() || '';
    for (const [key, val] of Object.entries(CATEGORY_HINTS)) {
      if (slug.includes(key) || cat.includes(key)) return val;
    }
  }
  return 'operations';
}

export class ZapierCrawler implements CrawlerSource {
  name = 'zapier-templates';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const results: RawWorkflow[] = [];
    let offset = 0;
    const limit = 100;

    console.log(`[Zapier] Démarrage du crawl (max: ${maxResults})`);

    while (results.length < maxResults) {
      try {
        const url = `${ZAPIER_API}?limit=${limit}&offset=${offset}&status=active`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Fluxteka/1.0', 'Accept': 'application/json' },
        });

        if (!res.ok) {
          console.warn(`[Zapier] API ${res.status}: ${res.statusText}`);
          break;
        }

        const data: ZapierResponse = await res.json();
        const templates = data.objects || [];
        if (templates.length === 0) break;

        console.log(`[Zapier] Offset ${offset}: ${templates.length} templates`);

        for (const tpl of templates) {
          if (results.length >= maxResults) break;
          if (tpl.status !== 'published' && tpl.status !== 'active') continue;

          const apps = (tpl.steps || []).map(s => s.app?.name || '').filter(Boolean);
          const appSlugs = (tpl.steps || []).map(s => s.app?.slug || '').filter(Boolean);
          const category = mapCategory(tpl.steps || []);

          const tags = [
            'zapier', 'automation', 'workflow', 'zap',
            ...appSlugs.slice(0, 5),
          ].filter(Boolean).slice(0, 10);

          const rawContent = [
            `Platform: Zapier`,
            `Title: ${tpl.title}`,
            `Description: ${tpl.description_plain || tpl.description_raw || ''}`,
            `Apps: ${apps.join(', ')}`,
            `Uses: ${appSlugs.join(', ')}`,
            `Creates: ${tpl.creates_count || 0} times`,
            ``,
            `Ce Zap connecte ${apps.join(' avec ')} pour automatiser tes tâches.`,
            `Zapier est la plateforme no-code leader pour connecter 5 000+ apps.`,
          ].join('\n');

          results.push({
            url: tpl.url || `https://zapier.com/apps/zap-templates/${tpl.slug || tpl.id}`,
            title: tpl.title,
            rawContent,
            tool: 'zapier',
            sourceType: 'zapier-templates',
            sourceStars: tpl.creates_count || 0,
            sourceViews: tpl.creates_count || 0,
            author: 'zapier',
            authorUrl: 'https://zapier.com',
            tags,
          });
        }

        if (templates.length < limit) break;
        offset += limit;
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.error(`[Zapier] Erreur offset ${offset}: ${err}`);
        break;
      }
    }

    console.log(`[Zapier] ${results.length} workflows générés`);
    return results;
  }
}
