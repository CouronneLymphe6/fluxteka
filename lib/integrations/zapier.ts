/**
 * lib/integrations/zapier.ts
 * Intégration officielle Zapier — API publique des Zap Templates
 * Docs : https://platform.zapier.com/embed/zap-templates
 *
 * Aucune clé API requise pour les templates publics.
 * Rate limit : respecté via délai entre pages.
 */

export interface ZapierTemplate {
  id: number;
  title: string;
  slug: string;
  description_plain: string;
  url: string;
  status: string;
  creates_count: number;
  steps: ZapierStep[];
  type: string;
}

export interface ZapierStep {
  app: {
    name: string;
    slug: string;
    category_label: string;
    image: string;
    url: string;
  };
  action_id: string;
  type_of: string;
}

interface ZapierApiResponse {
  objects: ZapierTemplate[];
  meta: {
    total_count: number;
    limit: number;
    offset: number;
  };
}

const BASE_URL = 'https://zapier.com/api/v3/zap-templates';
const PAGE_SIZE = 100;
const DELAY_MS = 400; // Respecter le rate limit

/**
 * Récupère une page de templates Zapier
 */
async function fetchPage(offset: number): Promise<ZapierApiResponse> {
  const url = `${BASE_URL}/?limit=${PAGE_SIZE}&offset=${offset}&status=active`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Fluxteka/1.0 (contact@fluxteka.com)',
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Zapier API error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Récupère tous les templates Zapier jusqu'à maxResults
 */
export async function fetchZapierTemplates(
  maxResults = 1000,
  onProgress?: (fetched: number, total: number) => void,
): Promise<ZapierTemplate[]> {
  const templates: ZapierTemplate[] = [];
  let offset = 0;
  let totalCount = 0;

  do {
    const data = await fetchPage(offset);

    if (offset === 0) {
      totalCount = data.meta.total_count;
      console.log(`[Zapier API] ${totalCount} templates disponibles`);
    }

    const active = data.objects.filter(t => t.status === 'active' || t.status === 'published');
    templates.push(...active);
    offset += PAGE_SIZE;

    onProgress?.(templates.length, Math.min(totalCount, maxResults));

    if (data.objects.length < PAGE_SIZE) break;
    if (templates.length >= maxResults) break;

    await new Promise(r => setTimeout(r, DELAY_MS));
  } while (templates.length < maxResults);

  return templates.slice(0, maxResults);
}

/**
 * Extrait les apps connectées d'un template
 */
export function getConnectedApps(template: ZapierTemplate): string[] {
  return [...new Set(template.steps.map(s => s.app?.name).filter(Boolean))];
}

/**
 * Mappe la catégorie Zapier vers la catégorie Fluxteka
 */
export function mapZapierCategory(template: ZapierTemplate): string {
  const slugs = template.steps.map(s => s.app?.slug?.toLowerCase() || '');
  const cats = template.steps.map(s => s.app?.category_label?.toLowerCase() || '');
  const all = [...slugs, ...cats].join(' ');

  if (/openai|gpt|claude|anthropic|gemini|mistral|ai/.test(all)) return 'ai-agents';
  if (/gmail|email|mailchimp|sendgrid|outlook/.test(all)) return 'communication';
  if (/slack|discord|teams|telegram/.test(all)) return 'communication';
  if (/hubspot|salesforce|pipedrive|crm/.test(all)) return 'crm';
  if (/stripe|paypal|invoice|billing/.test(all)) return 'finance-admin';
  if (/shopify|woocommerce|ecommerce/.test(all)) return 'ecommerce';
  if (/twitter|instagram|facebook|linkedin|social/.test(all)) return 'marketing-content';
  if (/github|gitlab|jira|bitbucket|code/.test(all)) return 'dev-tech';
  if (/sheets|airtable|database|mysql|postgres/.test(all)) return 'data-analytics';
  if (/hr|hiring|recruit|bamboo/.test(all)) return 'hr-recrutement';
  if (/sales|deal|prospect|lead/.test(all)) return 'sales-prospection';
  if (/support|zendesk|intercom|helpdesk/.test(all)) return 'customer-success';

  return 'operations';
}
