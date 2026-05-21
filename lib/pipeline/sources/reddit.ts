/**
 * Reddit Crawler — Recherche de workflows dans les subreddits d'automatisation
 *
 * Stratégie : OAuth2 → Search → Filtrer posts à score > 5
 * Subreddits cibles : r/n8n, r/Integromat, r/zapier, r/LangChain, r/automation
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const SUBREDDITS = [
  { sub: 'n8n', tool: 'n8n' },
  { sub: 'Integromat', tool: 'make' },
  { sub: 'zapier', tool: 'zapier' },
  { sub: 'LangChain', tool: 'langchain' },
  { sub: 'automation', tool: 'other' },
];

const SEARCH_TERMS = ['workflow', 'template', 'automation', 'tutorial', 'guide', 'share'];

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  score: number;
  num_comments: number;
  author: string;
  created_utc: number;
  link_flair_text?: string;
  subreddit: string;
}

async function getRedditToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Fluxteka/1.0',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`Reddit auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function redditFetch(url: string, token: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Fluxteka/1.0 (by /u/fluxteka)',
    },
  });
}

function detectToolFromSubreddit(sub: string): string {
  const map: Record<string, string> = {
    n8n: 'n8n',
    integromat: 'make',
    zapier: 'zapier',
    langchain: 'langchain',
  };
  return map[sub.toLowerCase()] || 'other';
}

export class RedditCrawler implements CrawlerSource {
  name = 'reddit';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Reddit credentials not configured');

    const token = await getRedditToken(clientId, clientSecret);
    const results: RawWorkflow[] = [];
    const seenUrls = new Set<string>();
    const perSub = Math.ceil(maxResults / SUBREDDITS.length);

    for (const { sub, tool } of SUBREDDITS) {
      if (results.length >= maxResults) break;

      for (const term of SEARCH_TERMS) {
        if (results.length >= maxResults) break;

        try {
          const res = await redditFetch(
            `https://oauth.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(term)}&sort=relevance&t=year&limit=${Math.min(perSub, 25)}&restrict_sr=on`,
            token
          );

          if (!res.ok) continue;
          const data = await res.json();
          const posts: RedditPost[] = (data.data?.children || []).map((c: { data: RedditPost }) => c.data);

          for (const post of posts) {
            if (results.length >= maxResults) break;

            const postUrl = `https://reddit.com${post.permalink}`;
            if (seenUrls.has(postUrl)) continue;
            seenUrls.add(postUrl);

            // Skip low-quality posts
            if (post.score < 5) continue;
            // Skip posts with very little content
            if (!post.selftext || post.selftext.length < 100) continue;
            // Skip deleted/removed
            if (post.selftext === '[deleted]' || post.selftext === '[removed]') continue;

            results.push({
              url: postUrl,
              title: post.title,
              rawContent: [
                `Title: ${post.title}`,
                `Subreddit: r/${post.subreddit}`,
                `Score: ${post.score}`,
                `Comments: ${post.num_comments}`,
                `Author: u/${post.author}`,
                `Flair: ${post.link_flair_text || 'none'}`,
                '',
                post.selftext.substring(0, 5000),
              ].join('\n'),
              tool: detectToolFromSubreddit(post.subreddit) || tool,
              sourceType: 'reddit',
              sourceStars: post.score,
              sourceViews: post.num_comments,
              author: post.author,
              authorUrl: `https://reddit.com/u/${post.author}`,
              tags: [post.subreddit.toLowerCase()],
            });
          }

          // Rate limit: Reddit allows 60 req/min with OAuth
          await new Promise(r => setTimeout(r, 1500));
        } catch {
          continue;
        }
      }
    }

    return results;
  }
}
