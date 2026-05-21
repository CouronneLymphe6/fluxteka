/**
 * GitHub Crawler — Recherche des workflows d'automatisation sur GitHub
 *
 * Stratégie : Search API → repos/gists avec mots-clés automation
 * Cible : fichiers JSON n8n, blueprints Make, templates Zapier, scripts LangChain
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const SEARCH_QUERIES = [
  { q: 'n8n workflow template', tool: 'n8n' },
  { q: 'n8n automation json', tool: 'n8n' },
  { q: 'make integromat blueprint scenario', tool: 'make' },
  { q: 'zapier template automation', tool: 'zapier' },
  { q: 'langchain agent chain tool', tool: 'langchain' },
  { q: 'langchain rag pipeline', tool: 'langchain' },
];

interface GitHubRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  topics: string[];
  owner: { login: string; html_url: string };
  default_branch: string;
  updated_at: string;
}

async function githubFetch(url: string, token: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

async function getReadmeContent(repo: GitHubRepo, token: string): Promise<string> {
  try {
    const res = await githubFetch(
      `https://api.github.com/repos/${repo.full_name}/readme`,
      token
    );
    if (!res.ok) return '';
    const data = await res.json();
    if (data.encoding === 'base64' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8').substring(0, 5000);
    }
    return '';
  } catch {
    return '';
  }
}

function detectTool(repo: GitHubRepo): string {
  const text = `${repo.full_name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
  if (text.includes('n8n')) return 'n8n';
  if (text.includes('make') || text.includes('integromat')) return 'make';
  if (text.includes('zapier')) return 'zapier';
  if (text.includes('langchain') || text.includes('langgraph')) return 'langchain';
  return 'other';
}

export class GitHubCrawler implements CrawlerSource {
  name = 'github';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not configured');

    const results: RawWorkflow[] = [];
    const seenUrls = new Set<string>();
    const perQuery = Math.ceil(maxResults / SEARCH_QUERIES.length);

    for (const { q, tool } of SEARCH_QUERIES) {
      if (results.length >= maxResults) break;

      try {
        // Limite : 30 requêtes/min avec token, on prend page 1 seulement
        const res = await githubFetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${Math.min(perQuery, 30)}`,
          token
        );

        if (!res.ok) {
          if (res.status === 403) {
            // Rate limited — wait and skip
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }
          continue;
        }

        const data = await res.json();
        const repos: GitHubRepo[] = data.items || [];

        for (const repo of repos) {
          if (results.length >= maxResults) break;
          if (seenUrls.has(repo.html_url)) continue;
          seenUrls.add(repo.html_url);

          // Skip repos with < 3 stars (likely noise)
          if (repo.stargazers_count < 3) continue;

          // Get README for content
          const readme = await getReadmeContent(repo, token);
          const rawContent = [
            `Repository: ${repo.full_name}`,
            `Description: ${repo.description || 'N/A'}`,
            `Stars: ${repo.stargazers_count}`,
            `Topics: ${(repo.topics || []).join(', ')}`,
            `Last updated: ${repo.updated_at}`,
            '',
            readme,
          ].join('\n');

          results.push({
            url: repo.html_url,
            title: repo.description || repo.full_name.split('/').pop() || repo.full_name,
            rawContent,
            tool: detectTool(repo) || tool,
            sourceType: 'github',
            sourceStars: repo.stargazers_count,
            author: repo.owner.login,
            authorUrl: repo.owner.html_url,
            tags: repo.topics || [],
          });

          // Rate limit courtesy: 100ms between README fetches
          await new Promise(r => setTimeout(r, 100));
        }

        // Pause between search queries (rate limit)
        await new Promise(r => setTimeout(r, 2000));
      } catch {
        // Skip failed query, continue with others
        continue;
      }
    }

    return results;
  }
}
