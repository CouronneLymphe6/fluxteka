/**
 * lib/integrations/make.ts
 * Intégration officielle Make (ex-Integromat) — API REST v2
 * Docs : https://www.make.com/en/api-documentation/templates-list
 *
 * Requiert : MAKE_API_TOKEN dans .env.local
 * Obtenir le token : make.com → Profil → API → Générer un token
 *
 * Région EU : eu1.make.com (France/Europe)
 * Région US : us1.make.com
 */

export interface MakeTemplate {
  id: number;
  name: string;
  description: string;
  url: string;
  apps: MakeApp[];
  usedCount: number;
  isPublic: boolean;
  categories: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MakeApp {
  id: string;
  name: string;
  theme: string;
  iconUrl: string;
}

interface MakeApiResponse {
  templates: MakeTemplate[];
  pg: {
    sortBy: string;
    sortDir: string;
    pg: number;
    limit: number;
  };
}

const EU_BASE = 'https://eu1.make.com/api/v2';
const US_BASE = 'https://us1.make.com/api/v2';
const PAGE_SIZE = 100;
const DELAY_MS = 500;

function getBaseUrl(): string {
  // Préférer EU pour RGPD
  return process.env.MAKE_API_REGION === 'us' ? US_BASE : EU_BASE;
}

function getHeaders(): Record<string, string> {
  const token = process.env.MAKE_API_TOKEN;
  if (!token) throw new Error('MAKE_API_TOKEN manquant dans .env.local');

  return {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Fluxteka/1.0',
  };
}

/**
 * Récupère une page de templates Make
 */
async function fetchPage(page: number): Promise<MakeApiResponse> {
  const base = getBaseUrl();
  const url = `${base}/templates?pg[limit]=${PAGE_SIZE}&pg[offset]=${(page - 1) * PAGE_SIZE}&isPublic=true`;

  const res = await fetch(url, { headers: getHeaders() });

  if (res.status === 401) throw new Error('MAKE_API_TOKEN invalide — vérifier le token dans .env.local');
  if (res.status === 403) throw new Error('Accès refusé — vérifier les permissions du token Make');
  if (!res.ok) throw new Error(`Make API error ${res.status}: ${res.statusText}`);

  return res.json();
}

/**
 * Récupère tous les templates Make publics
 */
export async function fetchMakeTemplates(
  maxResults = 1000,
  onProgress?: (fetched: number) => void,
): Promise<MakeTemplate[]> {
  const token = process.env.MAKE_API_TOKEN;
  if (!token) {
    console.error('[Make API] ⚠️  MAKE_API_TOKEN non configuré');
    console.error('[Make API] → Aller sur make.com → Profil → API → Générer un token');
    console.error('[Make API] → Ajouter MAKE_API_TOKEN=xxx dans .env.local');
    return [];
  }

  const templates: MakeTemplate[] = [];
  let page = 1;

  console.log(`[Make API] Démarrage (région: ${process.env.MAKE_API_REGION || 'EU'})`);

  while (templates.length < maxResults) {
    try {
      const data = await fetchPage(page);
      const items = data.templates || [];

      if (items.length === 0) break;

      const publicItems = items.filter(t => t.isPublic);
      templates.push(...publicItems);
      page++;

      onProgress?.(templates.length);

      if (items.length < PAGE_SIZE) break;

      await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (err) {
      console.error(`[Make API] Erreur page ${page}: ${err}`);
      break;
    }
  }

  console.log(`[Make API] ${templates.length} templates récupérés`);
  return templates.slice(0, maxResults);
}

/**
 * Extrait les apps connectées d'un template Make
 */
export function getMakeConnectedApps(template: MakeTemplate): string[] {
  return [...new Set(template.apps.map(a => a.name).filter(Boolean))];
}

/**
 * Mappe les catégories Make vers les catégories Fluxteka
 */
export function mapMakeCategory(template: MakeTemplate): string {
  const cats = template.categories?.join(' ').toLowerCase() || '';
  const tags = template.tags?.join(' ').toLowerCase() || '';
  const all = `${cats} ${tags} ${template.name.toLowerCase()}`;

  if (/ai|gpt|claude|openai|artificial|intelligence/.test(all)) return 'ai-agents';
  if (/email|gmail|mailchimp|newsletter/.test(all)) return 'communication';
  if (/slack|discord|teams|chat/.test(all)) return 'communication';
  if (/crm|salesforce|hubspot|pipedrive/.test(all)) return 'crm';
  if (/ecommerce|shopify|woo|boutique|shop/.test(all)) return 'ecommerce';
  if (/finance|stripe|facturation|invoice|payment/.test(all)) return 'finance-admin';
  if (/marketing|social|instagram|facebook|twitter/.test(all)) return 'marketing-content';
  if (/dev|github|code|api|webhook/.test(all)) return 'dev-tech';
  if (/data|analytics|sheet|database/.test(all)) return 'data-analytics';
  if (/rh|hr|recrutement|recruitment/.test(all)) return 'hr-recrutement';
  if (/sales|vente|prospect|lead/.test(all)) return 'sales-prospection';
  if (/support|helpdesk|ticket|zendesk/.test(all)) return 'customer-success';

  return 'operations';
}
