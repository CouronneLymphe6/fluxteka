/**
 * Pipedream Apps Crawler — Uses GitHub API to list Pipedream components
 * (The old v1/apps endpoint returned 404)
 *
 * Source: https://github.com/PipedreamHQ/pipedream/tree/master/components
 * Each top-level directory = one app integration
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const GITHUB_API = 'https://api.github.com/repos/PipedreamHQ/pipedream/contents/components';

// Catégories Pipedream → catégories Fluxteka
const CATEGORY_MAP: Record<string, string> = {
  'crm': 'crm',
  'email': 'communication',
  'communication': 'communication',
  'marketing': 'marketing-content',
  'developer': 'dev-tech',
  'data': 'data-analytics',
  'analytics': 'data-analytics',
  'payment': 'finance-admin',
  'ecommerce': 'ecommerce',
  'hr': 'hr-recrutement',
  'project': 'operations',
  'productivity': 'operations',
  'social': 'marketing-content',
  'ai': 'ai-agents',
  'security': 'dev-tech',
  'support': 'customer-success',
  'sales': 'sales-prospection',
  'slack': 'communication',
  'gmail': 'communication',
  'google': 'operations',
  'github': 'dev-tech',
  'stripe': 'finance-admin',
  'shopify': 'ecommerce',
  'notion': 'operations',
  'airtable': 'data-analytics',
  'hubspot': 'crm',
  'salesforce': 'crm',
};

function mapCategory(slug: string): string {
  const lower = slug.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return val;
  }
  return 'operations';
}

function buildTags(slug: string, appName: string): string[] {
  return [
    ...new Set([slug, 'pipedream', 'automation', 'workflow', 'serverless', 'integration', appName.toLowerCase()]),
  ].slice(0, 10);
}

export class PipedreamCrawler implements CrawlerSource {
  name = 'pipedream-apps';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const results: RawWorkflow[] = [];
    const seenSlugs = new Set<string>();
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      'User-Agent': 'Fluxteka/1.0',
      'Accept': 'application/vnd.github+json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`[Pipedream] Démarrage du crawl GitHub (max: ${maxResults})`);

    // List top-level component directories — each dir = one app
    let dirs: Array<{ name: string; type: string }> = [];
    try {
      const res = await fetch(GITHUB_API, { headers });
      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
      dirs = await res.json();
    } catch (err) {
      console.error(`[Pipedream] Erreur listing GitHub: ${err}`);
      return results;
    }

    const appDirs = dirs.filter(d => d.type === 'dir').slice(0, maxResults);
    console.log(`[Pipedream] ${appDirs.length} apps trouvées`);

    for (const dir of appDirs) {
      if (results.length >= maxResults) break;
      if (seenSlugs.has(dir.name)) continue;
      seenSlugs.add(dir.name);

      const slug = dir.name;
      const appName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const category = mapCategory(slug);
      const tags = buildTags(slug, appName);

      const rawContent = [
        `Platform: Pipedream`,
        `App: ${appName}`,
        `Slug: ${slug}`,
        `Description: Intégration ${appName} pour Pipedream — automatisation serverless`,
        `Source: GitHub PipedreamHQ/pipedream`,
        ``,
        `${appName} est disponible sur Pipedream, la plateforme d'automatisation serverless pour développeurs.`,
        `Pipedream permet de créer des workflows Node.js en connectant ${appName} à des centaines d'autres services.`,
      ].join('\n');

      results.push({
        url: `https://pipedream.com/apps/${slug}`,
        title: `Workflow ${appName} avec Pipedream`,
        rawContent,
        tool: 'pipedream',
        sourceType: 'pipedream-apps',
        sourceStars: 0,
        sourceViews: 0,
        author: 'pipedream',
        authorUrl: 'https://pipedream.com',
        tags,
      });

      // Respect GitHub rate limit
      await new Promise(r => setTimeout(r, 50));
    }

    console.log(`[Pipedream] ${results.length} workflows générés`);
    return results;
  }
}
