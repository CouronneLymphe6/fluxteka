/**
 * YouTube Crawler — Recherche de tutoriels d'automatisation sur YouTube
 *
 * Stratégie : YouTube Data API v3 → Search → Filtre par vues et durée
 * Cible : Tutoriels N8N, Make, Zapier, LangChain
 */

import type { CrawlerSource, RawWorkflow } from '../engine';

const SEARCH_QUERIES = [
  { q: 'n8n workflow tutorial', tool: 'n8n' },
  { q: 'n8n automation template', tool: 'n8n' },
  { q: 'make integromat automation tutorial', tool: 'make' },
  { q: 'make scenario blueprint', tool: 'make' },
  { q: 'zapier automation tutorial 2025', tool: 'zapier' },
  { q: 'langchain agent tutorial python', tool: 'langchain' },
  { q: 'langchain rag tutorial', tool: 'langchain' },
];

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    thumbnails: { high?: { url: string } };
  };
}

interface YouTubeVideoStats {
  id: string;
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  contentDetails: {
    duration: string; // ISO 8601 (PT5M30S)
  };
}

function parseDuration(iso: string): number {
  // PT1H2M30S → seconds
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0') * 3600) +
         (parseInt(match[2] || '0') * 60) +
         parseInt(match[3] || '0');
}

function detectTool(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('n8n')) return 'n8n';
  if (text.includes('make') || text.includes('integromat')) return 'make';
  if (text.includes('zapier')) return 'zapier';
  if (text.includes('langchain') || text.includes('langgraph')) return 'langchain';
  return 'other';
}

export class YouTubeCrawler implements CrawlerSource {
  name = 'youtube';

  async crawl(maxResults: number): Promise<RawWorkflow[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error('YOUTUBE_API_KEY not configured');

    const results: RawWorkflow[] = [];
    const seenIds = new Set<string>();
    const perQuery = Math.ceil(maxResults / SEARCH_QUERIES.length);

    for (const { q, tool } of SEARCH_QUERIES) {
      if (results.length >= maxResults) break;

      try {
        // Step 1: Search
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoDuration=medium&order=viewCount&maxResults=${Math.min(perQuery, 25)}&key=${apiKey}`
        );

        if (!searchRes.ok) continue;
        const searchData = await searchRes.json();
        const items: YouTubeSearchItem[] = searchData.items || [];

        // Collect video IDs for batch stats fetch
        const videoIds = items
          .map(item => item.id.videoId)
          .filter(id => !seenIds.has(id));

        if (videoIds.length === 0) continue;

        // Step 2: Get stats + duration for all videos
        const statsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`
        );

        const statsMap = new Map<string, YouTubeVideoStats>();
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          for (const item of (statsData.items || [])) {
            statsMap.set(item.id, item);
          }
        }

        // Step 3: Build results
        for (const item of items) {
          if (results.length >= maxResults) break;
          const videoId = item.id.videoId;
          if (seenIds.has(videoId)) continue;
          seenIds.add(videoId);

          const stats = statsMap.get(videoId);
          const viewCount = parseInt(stats?.statistics?.viewCount || '0');
          const duration = parseDuration(stats?.contentDetails?.duration || '');

          // Filters:
          // - Skip shorts (< 2 min)
          // - Skip very long videos (> 60 min) — likely full courses, not single workflows
          // - Skip low-view videos (< 500 views)
          if (duration < 120 || duration > 3600 || viewCount < 500) continue;

          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

          results.push({
            url: videoUrl,
            title: item.snippet.title,
            rawContent: [
              `Title: ${item.snippet.title}`,
              `Channel: ${item.snippet.channelTitle}`,
              `Published: ${item.snippet.publishedAt}`,
              `Views: ${viewCount}`,
              `Likes: ${stats?.statistics?.likeCount || 'N/A'}`,
              `Duration: ${Math.round(duration / 60)} minutes`,
              '',
              `Description:`,
              item.snippet.description.substring(0, 3000),
            ].join('\n'),
            tool: detectTool(item.snippet.title, item.snippet.description) || tool,
            sourceType: 'youtube',
            sourceStars: parseInt(stats?.statistics?.likeCount || '0'),
            sourceViews: viewCount,
            author: item.snippet.channelTitle,
            authorUrl: `https://www.youtube.com/channel/${item.snippet.channelId}`,
            tags: [],
          });
        }

        // YouTube API courtesy delay
        await new Promise(r => setTimeout(r, 500));
      } catch {
        continue;
      }
    }

    return results;
  }
}
