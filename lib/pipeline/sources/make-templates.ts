/**
 * Make (ex-Integromat) Templates Crawler
 *
 * Scrape les templates publics de make.com/en/templates
 * Make n'a pas d'API publique documentée, mais expose un endpoint JSON interne.
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const MAKE_CATEGORIES = [
  'marketing', 'sales', 'customer-support', 'hr', 'finance',
  'it-operations', 'project-management', 'ecommerce', 'education',
];

interface MakeTemplate {
  id: number;
  name: string;
  description: string;
  slug: string;
  apps: { name: string; slug: string }[];
  category?: { name: string; slug: string };
  usageCount?: number;
  createdAt?: string;
}

export class MakeTemplatesCrawler implements CrawlerSource {
  name = 'make-templates';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const results: RawWorkflow[] = [];
    const seenIds = new Set<number>();
    const perCategory = Math.ceil(maxResults / MAKE_CATEGORIES.length);

    for (const category of MAKE_CATEGORIES) {
      if (results.length >= maxResults) break;

      try {
        // Make exposes a JSON API for their template gallery
        const res = await fetch(
          `https://www.make.com/api/v2/templates?category=${category}&limit=${Math.min(perCategory, 30)}&sort=popular`,
          {
            headers: {
              'User-Agent': 'Fluxteka/1.0',
              Accept: 'application/json',
            },
          }
        );

        if (!res.ok) {
          // Fallback: try alternative endpoint
          const altRes = await fetch(
            `https://www.make.com/en/templates/api?category=${category}&limit=${Math.min(perCategory, 20)}`,
            { headers: { 'User-Agent': 'Fluxteka/1.0', Accept: 'application/json' } }
          );
          if (!altRes.ok) continue;
          const altData = await altRes.json();
          const templates: MakeTemplate[] = altData.templates || altData.data || altData || [];
          if (!Array.isArray(templates)) continue;

          for (const tpl of templates) {
            if (results.length >= maxResults || seenIds.has(tpl.id)) continue;
            seenIds.add(tpl.id);
            results.push(this.toRawWorkflow(tpl, category));
          }
          continue;
        }

        const data = await res.json();
        const templates: MakeTemplate[] = data.templates || data.data || data || [];
        if (!Array.isArray(templates)) continue;

        for (const tpl of templates) {
          if (results.length >= maxResults || seenIds.has(tpl.id)) continue;
          seenIds.add(tpl.id);

          // Skip templates with < 2 connected apps (too simple)
          if ((tpl.apps || []).length < 2) continue;

          results.push(this.toRawWorkflow(tpl, category));
        }

        await new Promise(r => setTimeout(r, 2000));
      } catch {
        continue;
      }
    }

    return results;
  }

  private toRawWorkflow(tpl: MakeTemplate, category: string): RawWorkflow {
    const apps = (tpl.apps || []).map(a => a.name);
    const url = `https://www.make.com/en/templates/${tpl.id}-${tpl.slug || tpl.name.toLowerCase().replace(/\s+/g, '-')}`;

    return {
      url,
      title: tpl.name,
      rawContent: [
        `Name: ${tpl.name}`,
        `Description: ${tpl.description || 'N/A'}`,
        `Connected Apps: ${apps.join(', ')}`,
        `Category: ${tpl.category?.name || category}`,
        `Usage: ${tpl.usageCount || 'N/A'}`,
        '',
        tpl.description || '',
      ].join('\n'),
      tool: 'make',
      sourceType: 'make-templates',
      sourceStars: tpl.usageCount || 0,
      author: 'Make Community',
      tags: [category, ...apps.map(a => a.toLowerCase())].slice(0, 10),
    };
  }
}
