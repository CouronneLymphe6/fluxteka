/**
 * POST /api/pipeline/run — Déclenche le pipeline d'indexation
 *
 * Sécurisé par CRON_SECRET (Vercel Cron ou appel admin).
 * Body optionnel : { sources?: string[], maxPerSource?: number, dryRun?: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';
import { runPipeline, type PipelineResult, type CrawlerSource } from '@/lib/pipeline/engine';
import { GitHubCrawler } from '@/lib/pipeline/sources/github';
import { RedditCrawler } from '@/lib/pipeline/sources/reddit';
import { YouTubeCrawler } from '@/lib/pipeline/sources/youtube';
import { N8NCommunityWalker } from '@/lib/pipeline/sources/n8n-community';
import { MakeTemplatesCrawler } from '@/lib/pipeline/sources/make-templates';
import { AIAgentsCrawler } from '@/lib/pipeline/sources/ai-agents';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max (Vercel Pro)

const SOURCES: Record<string, () => CrawlerSource> = {
  'n8n-community': () => new N8NCommunityWalker(),
  'make-templates': () => new MakeTemplatesCrawler(),
  'ai-agents': () => new AIAgentsCrawler(),
  github: () => new GitHubCrawler(),
  reddit: () => new RedditCrawler(),
  youtube: () => new YouTubeCrawler(),
};

export async function POST(request: NextRequest) {
  // ── Auth: Verify CRON_SECRET ──
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse options ──
  let body: { sources?: string[]; maxPerSource?: number; dryRun?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is OK — use defaults
  }

  const sourcesToRun = body.sources || Object.keys(SOURCES);
  const maxPerSource = body.maxPerSource ?? 50;
  const dryRun = body.dryRun ?? false;

  // ── Run pipeline for each source ──
  const results: PipelineResult[] = [];
  const startTime = Date.now();

  for (const sourceName of sourcesToRun) {
    const createSource = SOURCES[sourceName];
    if (!createSource) {
      results.push({
        source: sourceName,
        found: 0,
        newWorkflows: 0,
        duplicatesUrl: 0,
        duplicatesContent: 0,
        duplicatesTitle: 0,
        errors: 1,
        errorDetail: [`Unknown source: ${sourceName}`],
        durationMs: 0,
        tokensInput: 0,
        tokensOutput: 0,
        estimatedCostUsd: 0,
      });
      continue;
    }

    try {
      const source = createSource();
      const result = await runPipeline(source, {
        maxResults: maxPerSource,
        qualityThreshold: 5,
        dryRun,
      });
      results.push(result);
    } catch (err) {
      results.push({
        source: sourceName,
        found: 0,
        newWorkflows: 0,
        duplicatesUrl: 0,
        duplicatesContent: 0,
        duplicatesTitle: 0,
        errors: 1,
        errorDetail: [String(err)],
        durationMs: 0,
        tokensInput: 0,
        tokensOutput: 0,
        estimatedCostUsd: 0,
      });
    }
  }

  // ── Summary ──
  const summary = {
    totalDurationMs: Date.now() - startTime,
    dryRun,
    totalFound: results.reduce((s, r) => s + r.found, 0),
    totalNew: results.reduce((s, r) => s + r.newWorkflows, 0),
    totalDuplicates: results.reduce((s, r) => s + r.duplicatesUrl + r.duplicatesContent + r.duplicatesTitle, 0),
    totalErrors: results.reduce((s, r) => s + r.errors, 0),
    totalCostUsd: results.reduce((s, r) => s + r.estimatedCostUsd, 0).toFixed(4),
    totalTokensInput: results.reduce((s, r) => s + r.tokensInput, 0),
    totalTokensOutput: results.reduce((s, r) => s + r.tokensOutput, 0),
    sources: results,
  };

  return NextResponse.json(summary);
}
