/**
 * lib/integrations/n8n.ts
 * Intégration officielle n8n — API REST Publique
 * API: https://api.n8n.io/api/templates/workflows
 */

export interface N8nTemplate {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
  };
  nodes: { type: string }[];
}

const N8N_BASE = 'https://api.n8n.io/api/templates/workflows';
const DELAY_MS = 500;

/**
 * Récupère tous les templates n8n publics
 */
export async function fetchN8nTemplates(
  maxResults = 1000,
  onProgress?: (fetched: number) => void,
): Promise<N8nTemplate[]> {
  const templates: N8nTemplate[] = [];
  let page = 1;
  const limit = 100;

  console.log(`[n8n API] Démarrage`);

  while (templates.length < maxResults) {
    try {
      const url = `${N8N_BASE}?page=${page}&limit=${limit}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Fluxteka/1.0' },
      });

      if (!res.ok) {
        throw new Error(`n8n API error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const items = data.workflows || data || [];

      if (!Array.isArray(items) || items.length === 0) break;

      templates.push(...items);
      page++;

      onProgress?.(templates.length);

      if (items.length < limit) break;

      await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (err) {
      console.error(`[n8n API] Erreur page ${page}: ${err}`);
      break;
    }
  }

  console.log(`[n8n API] ${templates.length} templates récupérés`);
  return templates.slice(0, maxResults);
}

/**
 * Extrait les apps connectées d'un template n8n
 */
export function getN8nConnectedApps(template: N8nTemplate): string[] {
  if (!template.nodes) return [];
  const apps = template.nodes
    .map(n => {
      const parts = n.type.split('.');
      return parts.length > 1 ? parts[parts.length - 1] : null;
    })
    .filter(Boolean)
    .filter(a => !['n8n-nodes-base', 'core', 'webhook', 'http-request', 'schedule', 'cron', 'code', 'function', 'set', 'if', 'switch'].includes(a as string));
  
  return [...new Set(apps)] as string[];
}

/**
 * Mappe les catégories n8n vers les catégories Fluxteka
 */
export function mapN8nCategory(template: N8nTemplate): string {
  const all = `${template.description || ''} ${template.name || ''}`.toLowerCase();

  if (/ai|gpt|claude|openai|artificial|intelligence|langchain/.test(all)) return 'ai-agents';
  if (/email|gmail|mailchimp|newsletter/.test(all)) return 'communication';
  if (/slack|discord|teams|chat/.test(all)) return 'communication';
  if (/crm|salesforce|hubspot|pipedrive/.test(all)) return 'crm';
  if (/ecommerce|shopify|woo|boutique|shop/.test(all)) return 'ecommerce';
  if (/finance|stripe|facturation|invoice|payment/.test(all)) return 'finance-admin';
  if (/marketing|social|instagram|facebook|twitter|linkedin/.test(all)) return 'marketing-content';
  if (/dev|github|code|api|webhook/.test(all)) return 'dev-tech';
  if (/data|analytics|sheet|database|sql|postgres|mysql/.test(all)) return 'data-analytics';
  if (/rh|hr|recrutement|recruitment/.test(all)) return 'hr-recrutement';
  if (/sales|vente|prospect|lead/.test(all)) return 'sales-prospection';
  if (/support|helpdesk|ticket|zendesk/.test(all)) return 'customer-success';

  return 'operations';
}
