/**
 * N8N Community Crawler — Indexe les workflows publics de n8n.io/workflows
 *
 * N8N expose une API publique pour leur bibliothèque de templates.
 * C'est la source la plus riche pour les workflows n8n.
 * Endpoint: https://api.n8n.io/api/templates/search
 *
 * Supporte le crawl par recherche thématique pour couvrir toutes les catégories.
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const N8N_API_BASE = 'https://api.n8n.io/api/templates';

// Thematic search queries to cover all major categories
const SEARCH_QUERIES = [
  '', // Default popular
  'openai', 'claude', 'chatgpt', 'gemini', 'ai agent',
  'gmail', 'email', 'slack', 'telegram', 'whatsapp', 'discord',
  'notion', 'airtable', 'google sheets',
  'linkedin', 'twitter', 'instagram', 'tiktok', 'youtube',
  'shopify', 'stripe', 'ecommerce', 'woocommerce',
  'hubspot', 'salesforce', 'crm', 'pipedrive',
  'wordpress', 'seo', 'blog',
  'supabase', 'postgres', 'database',
  'figma', 'canva', 'design',
  'github', 'jira', 'devops',
  'invoice', 'finance', 'accounting',
  'hr', 'recruit', 'onboarding',
  'webhook', 'api', 'scraping',
  'pdf', 'document', 'summary',
  'rag', 'vector', 'embedding',
];

interface N8NNode {
  displayName?: string;
  name?: string;
}

interface N8NWorkflow {
  id: number;
  name: string;
  description: string;
  totalViews: number;
  createdAt: string;
  user: { username: string; name?: string };
  nodes: N8NNode[];
}

function extractConnectedTools(nodes: N8NNode[]): string[] {
  const tools = new Set<string>();
  for (const node of nodes) {
    const name = (node.displayName || node.name || '').toLowerCase();
    const mappings: Record<string, string> = {
      gmail: 'Gmail', slack: 'Slack', discord: 'Discord',
      'google sheets': 'Google Sheets', notion: 'Notion', airtable: 'Airtable',
      stripe: 'Stripe', shopify: 'Shopify', hubspot: 'HubSpot',
      salesforce: 'Salesforce', mailchimp: 'Mailchimp', sendgrid: 'SendGrid',
      twilio: 'Twilio', telegram: 'Telegram', whatsapp: 'WhatsApp',
      openai: 'OpenAI', anthropic: 'Anthropic', 'google ai': 'Google AI',
      'google gemini': 'Google Gemini',
      postgres: 'PostgreSQL', mysql: 'MySQL', mongodb: 'MongoDB',
      redis: 'Redis', supabase: 'Supabase', firebase: 'Firebase',
      webhook: 'Webhook', 'http request': 'HTTP API',
      github: 'GitHub', gitlab: 'GitLab', jira: 'Jira',
      trello: 'Trello', asana: 'Asana', 'google drive': 'Google Drive',
      dropbox: 'Dropbox', aws: 'AWS',
      twitter: 'Twitter/X', linkedin: 'LinkedIn', facebook: 'Facebook',
      wordpress: 'WordPress', woocommerce: 'WooCommerce',
      zendesk: 'Zendesk', intercom: 'Intercom',
      calendly: 'Calendly', 'google calendar': 'Google Calendar',
      'microsoft outlook': 'Outlook', 'microsoft teams': 'Microsoft Teams',
      'ai agent': 'AI Agent', code: 'Code', perplexity: 'Perplexity',
      'simple memory': 'Memory', wikipedia: 'Wikipedia',
      figma: 'Figma', canva: 'Canva',
      pipedrive: 'Pipedrive', clickup: 'ClickUp',
      'monday.com': 'Monday.com',
    };
    for (const [key, value] of Object.entries(mappings)) {
      if (name.includes(key)) {
        tools.add(value);
        break;
      }
    }
  }
  return Array.from(tools).slice(0, 15);
}

export class N8NCommunityWalker implements CrawlerSource {
  name = 'n8n-community';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const results: RawWorkflow[] = [];
    const seenIds = new Set<number>();
    const rowsPerPage = 20;

    // Calculate how many results per query
    const perQuery = Math.ceil(maxResults / SEARCH_QUERIES.length);

    for (const query of SEARCH_QUERIES) {
      if (results.length >= maxResults) break;

      let page = 1;
      const maxPagesPerQuery = Math.ceil(perQuery / rowsPerPage);

      while (results.length < maxResults && page <= maxPagesPerQuery) {
        try {
          const searchParam = query ? `&search=${encodeURIComponent(query)}` : '';
          const res = await fetch(
            `${N8N_API_BASE}/search?page=${page}&rows=${rowsPerPage}${searchParam}`,
            { headers: { 'User-Agent': 'Fluxteka/1.0' } }
          );

          if (!res.ok) break;
          const data = await res.json();
          const workflows: N8NWorkflow[] = data.workflows || [];

          if (!Array.isArray(workflows) || workflows.length === 0) break;

          for (const wf of workflows) {
            if (results.length >= maxResults) break;
            if (seenIds.has(wf.id)) continue;
            seenIds.add(wf.id);

            // ── Quality gate ──
            const nodeCount = wf.nodes?.length || 0;
            const views = wf.totalViews || 0;
            const descLen = (wf.description || '').length;

            // Min 3 nodes (real workflow, not a stub)
            if (nodeCount < 3) continue;
            // Min 100 views (community-validated)
            if (views < 100) continue;
            // Must have a real description (not empty/placeholder)
            if (descLen < 50) continue;

            const url = `https://n8n.io/workflows/${wf.id}`;
            const connectedTools = extractConnectedTools(wf.nodes || []);
            const desc = (wf.description || '').substring(0, 2000);

            results.push({
              url,
              title: wf.name,
              rawContent: [
                `Name: ${wf.name}`,
                `Description: ${desc}`,
                `Views: ${wf.totalViews || 0}`,
                `Nodes: ${nodeCount}`,
                `Connected Tools: ${connectedTools.join(', ')}`,
                `Created: ${wf.createdAt}`,
                `Author: ${wf.user?.name || wf.user?.username || 'unknown'}`,
                '',
                desc,
              ].join('\n'),
              tool: 'n8n',
              sourceType: 'n8n-community',
              sourceStars: wf.totalViews || 0,
              sourceViews: wf.totalViews || 0,
              author: wf.user?.name || wf.user?.username || 'n8n-community',
              authorUrl: `https://n8n.io/creators/${wf.user?.username}`,
              tags: connectedTools.map(t => t.toLowerCase()).slice(0, 10),
            });
          }

          page++;
          await new Promise(r => setTimeout(r, 800));
        } catch {
          break;
        }
      }

      // Small pause between queries
      await new Promise(r => setTimeout(r, 500));
    }

    return results;
  }
}
