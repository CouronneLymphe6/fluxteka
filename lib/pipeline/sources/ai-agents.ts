/**
 * LangChain Hub Crawler — Indexe les chains, prompts et agents publics
 *
 * LangChain Hub (smith.langchain.com/hub) expose les projets publics.
 * Aussi : scrape les repos GitHub populaires liés aux frameworks d'agents IA.
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

// Couvre : LangChain, CrewAI, AutoGen, LangGraph, Flowise, Dify, Activepieces
const AI_AGENT_QUERIES = [
  { q: 'langchain agent tool', tool: 'langchain' },
  { q: 'langchain rag retrieval', tool: 'langchain' },
  { q: 'langgraph workflow agent', tool: 'langchain' },
  { q: 'crewai agent crew task', tool: 'crewai' },
  { q: 'crewai multi-agent', tool: 'crewai' },
  { q: 'autogen agent microsoft', tool: 'autogen' },
  { q: 'autogen multi-agent conversation', tool: 'autogen' },
  { q: 'flowise chatflow template', tool: 'flowise' },
  { q: 'dify workflow agent', tool: 'dify' },
  { q: 'activepieces automation flow', tool: 'activepieces' },
  { q: 'windmill workflow script', tool: 'windmill' },
  { q: 'llamaindex agent rag', tool: 'llamaindex' },
];

interface GitHubSearchResult {
  items: {
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    topics: string[];
    owner: { login: string; html_url: string };
    updated_at: string;
  }[];
}

export class AIAgentsCrawler implements CrawlerSource {
  name = 'ai-agents';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not configured');

    const results: RawWorkflow[] = [];
    const seenUrls = new Set<string>();
    const perQuery = Math.ceil(maxResults / AI_AGENT_QUERIES.length);

    for (const { q, tool } of AI_AGENT_QUERIES) {
      if (results.length >= maxResults) break;

      try {
        const res = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${Math.min(perQuery, 20)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );

        if (!res.ok) {
          if (res.status === 403) {
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }
          continue;
        }

        const data: GitHubSearchResult = await res.json();

        for (const repo of data.items || []) {
          if (results.length >= maxResults) break;
          if (seenUrls.has(repo.html_url)) continue;
          seenUrls.add(repo.html_url);

          // Higher star threshold for AI repos (lots of noise)
          if (repo.stargazers_count < 10) continue;

          // Fetch README
          let readme = '';
          try {
            const readmeRes = await fetch(
              `https://api.github.com/repos/${repo.full_name}/readme`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/vnd.github+json',
                },
              }
            );
            if (readmeRes.ok) {
              const readmeData = await readmeRes.json();
              if (readmeData.encoding === 'base64' && readmeData.content) {
                readme = Buffer.from(readmeData.content, 'base64').toString('utf-8').substring(0, 4000);
              }
            }
          } catch { /* skip */ }

          const detectedTool = detectAITool(repo.full_name, repo.description || '', repo.topics || []) || tool;

          results.push({
            url: repo.html_url,
            title: repo.description || repo.full_name.split('/').pop() || repo.full_name,
            rawContent: [
              `Repository: ${repo.full_name}`,
              `Description: ${repo.description || 'N/A'}`,
              `Tool/Framework: ${detectedTool}`,
              `Stars: ${repo.stargazers_count}`,
              `Topics: ${(repo.topics || []).join(', ')}`,
              `Last updated: ${repo.updated_at}`,
              '',
              readme,
            ].join('\n'),
            tool: detectedTool,
            sourceType: 'github',
            sourceStars: repo.stargazers_count,
            author: repo.owner.login,
            authorUrl: repo.owner.html_url,
            tags: [...(repo.topics || []), detectedTool].slice(0, 10),
          });

          await new Promise(r => setTimeout(r, 150));
        }

        await new Promise(r => setTimeout(r, 3000));
      } catch {
        continue;
      }
    }

    return results;
  }
}

function detectAITool(name: string, desc: string, topics: string[]): string {
  const text = `${name} ${desc} ${topics.join(' ')}`.toLowerCase();

  const toolMap: [string[], string][] = [
    [['crewai', 'crew-ai', 'crew_ai'], 'crewai'],
    [['autogen', 'auto-gen', 'auto_gen'], 'autogen'],
    [['langgraph', 'lang-graph'], 'langchain'],
    [['langchain', 'lang-chain'], 'langchain'],
    [['llamaindex', 'llama-index', 'llama_index'], 'llamaindex'],
    [['flowise'], 'flowise'],
    [['dify'], 'dify'],
    [['activepieces'], 'activepieces'],
    [['windmill'], 'windmill'],
    [['n8n'], 'n8n'],
    [['make', 'integromat'], 'make'],
    [['zapier'], 'zapier'],
  ];

  for (const [keywords, tool] of toolMap) {
    if (keywords.some(k => text.includes(k))) return tool;
  }
  return 'other';
}
