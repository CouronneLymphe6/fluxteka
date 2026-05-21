/**
 * Zapier Templates Crawler — Indexe les templates publics de zapier.com
 *
 * Zapier expose ses templates via une API interne JSON.
 * Chaque template liste les apps connectées et une description.
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

// Most popular Zapier app categories to crawl
const ZAPIER_APP_QUERIES = [
  'gmail', 'slack', 'google-sheets', 'hubspot', 'salesforce',
  'shopify', 'stripe', 'notion', 'airtable', 'trello',
  'mailchimp', 'discord', 'asana', 'calendly', 'typeform',
  'jira', 'intercom', 'twilio', 'wordpress', 'woocommerce',
  'google-drive', 'dropbox', 'zoom', 'microsoft-teams',
  'github', 'clickup', 'monday', 'zendesk', 'pipedrive',
  'facebook-lead-ads', 'linkedin', 'instagram', 'tiktok',
];

interface ZapierTemplate {
  id: number;
  title: string;
  slug: string;
  description: string;
  description_plain?: string;
  steps: {
    api: string;
    title: string;
    action?: string;
  }[];
  status?: string;
  create_url?: string;
}

export class ZapierTemplatesCrawler implements CrawlerSource {
  name = 'zapier-templates';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const results: RawWorkflow[] = [];
    const seenIds = new Set<number>();
    const perApp = Math.ceil(maxResults / ZAPIER_APP_QUERIES.length);

    for (const app of ZAPIER_APP_QUERIES) {
      if (results.length >= maxResults) break;

      try {
        // Zapier exposes templates via their public API
        const res = await fetch(
          `https://zapier.com/api/v3/zap-templates?apps=${app}&limit=${Math.min(perApp, 20)}`,
          {
            headers: {
              'User-Agent': 'Fluxteka/1.0',
              Accept: 'application/json',
            },
          }
        );

        if (!res.ok) {
          // Try alternative endpoint
          const altRes = await fetch(
            `https://api.zapier.com/v1/zap-templates?apps=${app}&limit=${Math.min(perApp, 20)}`,
            {
              headers: {
                'User-Agent': 'Fluxteka/1.0',
                Accept: 'application/json',
              },
            }
          );
          if (!altRes.ok) continue;
          const altData = await altRes.json();
          this.processTemplates(altData, results, seenIds, maxResults);
          continue;
        }

        const data = await res.json();
        this.processTemplates(data, results, seenIds, maxResults);

        // Rate limit courtesy
        await new Promise(r => setTimeout(r, 1500));
      } catch {
        continue;
      }
    }

    return results;
  }

  private processTemplates(
    data: ZapierTemplate[] | { results?: ZapierTemplate[] },
    results: RawWorkflow[],
    seenIds: Set<number>,
    maxResults: number
  ): void {
    const templates = Array.isArray(data) ? data : (data.results || []);
    if (!Array.isArray(templates)) return;

    for (const tpl of templates) {
      if (results.length >= maxResults || seenIds.has(tpl.id)) continue;
      seenIds.add(tpl.id);

      // Skip templates with < 2 steps (too trivial)
      if (!tpl.steps || tpl.steps.length < 2) continue;

      const apps = tpl.steps.map(s => formatAppName(s.api || s.title || ''));
      const url = `https://zapier.com/apps/${tpl.slug || tpl.id}/integrations`;
      const desc = tpl.description_plain || tpl.description || '';

      results.push({
        url,
        title: tpl.title,
        rawContent: [
          `Name: ${tpl.title}`,
          `Description: ${desc}`,
          `Connected Apps: ${apps.join(', ')}`,
          `Steps: ${tpl.steps.map(s => `${s.title || s.api}: ${s.action || 'trigger/action'}`).join(' → ')}`,
          '',
          desc,
        ].join('\n'),
        tool: 'zapier',
        sourceType: 'zapier-templates',
        sourceStars: 0,
        author: 'Zapier Community',
        tags: apps.map(a => a.toLowerCase()).slice(0, 10),
      });
    }
  }
}

function formatAppName(raw: string): string {
  const mappings: Record<string, string> = {
    gmail: 'Gmail', slack: 'Slack', 'google-sheets': 'Google Sheets',
    'google sheets': 'Google Sheets', hubspot: 'HubSpot', salesforce: 'Salesforce',
    shopify: 'Shopify', stripe: 'Stripe', notion: 'Notion',
    airtable: 'Airtable', trello: 'Trello', mailchimp: 'Mailchimp',
    discord: 'Discord', asana: 'Asana', calendly: 'Calendly',
    typeform: 'Typeform', jira: 'Jira', intercom: 'Intercom',
    twilio: 'Twilio', wordpress: 'WordPress', woocommerce: 'WooCommerce',
    'google-drive': 'Google Drive', 'google drive': 'Google Drive',
    dropbox: 'Dropbox', zoom: 'Zoom', 'microsoft-teams': 'Microsoft Teams',
    github: 'GitHub', clickup: 'ClickUp', monday: 'Monday.com',
    zendesk: 'Zendesk', pipedrive: 'Pipedrive',
    'facebook-lead-ads': 'Facebook Lead Ads', linkedin: 'LinkedIn',
    instagram: 'Instagram', tiktok: 'TikTok',
  };

  const lower = raw.toLowerCase().replace(/app$/, '').trim();
  return mappings[lower] || raw.charAt(0).toUpperCase() + raw.slice(1);
}
