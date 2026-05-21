/**
 * Pipeline Engine — Orchestrateur central d'indexation Fluxteka
 *
 * Flux : Source → Crawl → Dedup (3 niveaux) → Enrich (Claude optionnel) → Insert DB → Log
 *
 * Chaque source implémente CrawlerSource et retourne des RawWorkflow[].
 * L'engine se charge de la déduplication, enrichissement IA, et insertion.
 *
 * MODE SANS IA : Si ANTHROPIC_API_KEY est absente, les workflows sont indexés
 * avec leurs données brutes (titre, description, tags de la source).
 */

import { prisma } from '@/lib/prisma';
import { normalizeUrl, contentFingerprint, titleSimilarity, parseAIResponse } from '@/lib/utils/dedup';
import { generateUniqueSlug } from '@/lib/utils/slug';

// ── Types ──

export interface RawWorkflow {
  url: string;
  title: string;
  rawContent: string;
  tool: string;                    // n8n, make, zapier, langchain, other
  sourceType: string;              // github, reddit, youtube, n8n-community, make-community
  sourceStars?: number;
  sourceViews?: number;
  author?: string;
  authorUrl?: string;
  tags?: string[];
}

export interface EnrichedWorkflow {
  title: string;
  description_fr: string;
  category: string;
  tags: string[];
  tools_connected: string[];
  how_to_use: string;
  prerequisites: string;
  quality_score: number;           // 1-10 — below threshold → skip
}

export interface CrawlerSource {
  name: string;
  crawl(maxResults: number): Promise<RawWorkflow[]>;
}

export interface PipelineResult {
  source: string;
  found: number;
  newWorkflows: number;
  duplicatesUrl: number;
  duplicatesContent: number;
  duplicatesTitle: number;
  errors: number;
  errorDetail: string[];
  durationMs: number;
  tokensInput: number;
  tokensOutput: number;
  estimatedCostUsd: number;
}

// ── AI Enrichment ──

const ENRICH_PROMPT = `Tu es un expert en automatisation (N8N, Make, Zapier, LangChain). 
Analyse ce workflow et retourne un JSON strict avec ces champs :

{
  "title": "Titre clair et descriptif en français (max 80 caractères)",
  "description_fr": "Description détaillée en français (200-400 mots). Explique ce que fait le workflow, pourquoi il est utile, et dans quel contexte l'utiliser.",
  "category": "Une seule catégorie parmi : email, crm, content, data, ai-agents, ecommerce, hr, finance, devops, marketing, social-media, other",
  "tags": ["5 à 10 tags pertinents en minuscules"],
  "tools_connected": ["Liste des outils/services connectés (ex: Gmail, Slack, Stripe, OpenAI...)"],
  "how_to_use": "Guide d'utilisation en français (3-5 étapes numérotées)",
  "prerequisites": "Prérequis en français (comptes nécessaires, clés API, etc.)",
  "quality_score": 7
}

quality_score : note de 1 à 10 basée sur :
- Utilité pratique (le workflow résout un vrai problème)
- Clarté (le titre et le contenu sont compréhensibles)
- Complétude (le workflow est fonctionnel, pas juste un squelette)
- Originalité (pas un exemple trivial type "Hello World")

Retourne UNIQUEMENT le JSON, aucun texte autour.`;

async function enrichWithClaude(
  raw: RawWorkflow,
  apiKey: string
): Promise<{ enriched: EnrichedWorkflow | null; tokensIn: number; tokensOut: number; error?: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `${ENRICH_PROMPT}\n\n--- WORKFLOW À ANALYSER ---\nTitre: ${raw.title}\nOutil: ${raw.tool}\nSource: ${raw.sourceType}\nContenu:\n${raw.rawContent.substring(0, 4000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { enriched: null, tokensIn: 0, tokensOut: 0, error: `Claude API ${response.status}: ${errText.substring(0, 200)}` };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const tokensIn = data.usage?.input_tokens || 0;
    const tokensOut = data.usage?.output_tokens || 0;

    const parsed = parseAIResponse(text);
    if (!parsed) {
      return { enriched: null, tokensIn, tokensOut, error: 'Failed to parse Claude JSON response' };
    }

    const enriched: EnrichedWorkflow = {
      title: String(parsed.title || raw.title),
      description_fr: String(parsed.description_fr || ''),
      category: String(parsed.category || 'other'),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
      tools_connected: Array.isArray(parsed.tools_connected) ? parsed.tools_connected.map(String) : [],
      how_to_use: String(parsed.how_to_use || ''),
      prerequisites: String(parsed.prerequisites || ''),
      quality_score: Number(parsed.quality_score) || 5,
    };

    return { enriched, tokensIn, tokensOut };
  } catch (err) {
    return { enriched: null, tokensIn: 0, tokensOut: 0, error: String(err) };
  }
}

// ── Fallback enrichment (no AI) ──

function guessCategory(raw: RawWorkflow): string {
  const text = `${raw.title} ${raw.rawContent}`.toLowerCase();
  const map: [string[], string][] = [
    // Agents IA — highest priority (keywords overlap with everything)
    [['agent', 'multi-agent', 'langgraph', 'crewai', 'autogen', 'rag', 'llm', 'chatbot', 'openai', 'claude', 'langchain', 'gpt', 'mistral', 'embedding', 'vector', 'pinecone'], 'ai-agents'],
    // Ventes & Prospection
    [['crm', 'hubspot', 'salesforce', 'pipedrive', 'lead', 'prospect', 'deal', 'sales', 'pipeline', 'cold email', 'outreach', 'apollo', 'lemlist', 'hunter'], 'sales-prospection'],
    // Marketing & Contenu
    [['blog', 'seo', 'article', 'wordpress', 'linkedin', 'twitter', 'instagram', 'social', 'post', 'publish', 'newsletter', 'campaign', 'mailchimp', 'brevo', 'sendgrid', 'substack', 'content', 'copywriting', 'ad ', 'ads', 'marketing', 'funnel'], 'marketing-content'],
    // Relation Client
    [['support', 'ticket', 'zendesk', 'intercom', 'freshdesk', 'customer', 'nps', 'review', 'feedback', 'satisfaction', 'churn', 'helpdesk'], 'customer-success'],
    // Communication (interne, notifications)
    [['slack', 'discord', 'teams', 'telegram', 'whatsapp', 'notification', 'alert', 'message', 'chat', 'email', 'mail', 'gmail', 'outlook', 'smtp', 'inbox'], 'communication'],
    // Data & Analytics
    [['data', 'analytics', 'dashboard', 'scraping', 'extract', 'csv', 'json', 'database', 'airtable', 'notion', 'google sheets', 'bigquery', 'report', 'etl', 'sync', 'migrate'], 'data-analytics'],
    // Dev & Tech
    [['github', 'gitlab', 'deploy', 'ci/cd', 'docker', 'kubernetes', 'api', 'webhook', 'monitoring', 'devops', 'server', 'cron', 'script', 'code review', 'pull request'], 'dev-tech'],
    // Finance & Admin
    [['invoice', 'payment', 'stripe', 'billing', 'accounting', 'finance', 'bank', 'tax', 'facture', 'comptabilité', 'expense', 'quickbooks', 'xero'], 'finance-admin'],
    // E-commerce
    [['shopify', 'woocommerce', 'product', 'order', 'cart', 'store', 'ecommerce', 'inventory', 'stock', 'shipping', 'amazon', 'ebay'], 'ecommerce'],
    // RH & Recrutement
    [['hr', 'recruit', 'cv', 'resume', 'employee', 'onboarding', 'bamboo', 'hiring', 'job', 'indeed', 'linkedin recruit', 'workday', 'vacation', 'payroll'], 'hr-recrutement'],
    // Opérations (fourre-tout métier non catégorisé)
    [['workflow', 'automation', 'process', 'task', 'project', 'asana', 'trello', 'jira', 'monday', 'approval', 'signature', 'document', 'pdf', 'form', 'calendar', 'meeting', 'zoom'], 'operations'],
  ];
  for (const [keywords, cat] of map) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return 'operations'; // default: opérations plutôt que 'other'
}

function enrichFromRaw(raw: RawWorkflow): EnrichedWorkflow {
  // Extract connected tools from tags
  const tools = (raw.tags || []).filter(t => t.length > 1).map(t =>
    t.charAt(0).toUpperCase() + t.slice(1)
  );

  return {
    title: raw.title.substring(0, 80),
    description_fr: raw.rawContent.substring(0, 800).replace(/\n{3,}/g, '\n\n'),
    category: guessCategory(raw),
    tags: (raw.tags || []).map(t => t.toLowerCase()).slice(0, 10),
    tools_connected: tools.slice(0, 10),
    how_to_use: '',
    prerequisites: '',
    quality_score: 6, // Baseline — can be upgraded by Claude later
  };
}

// ── Pipeline Engine ──

export async function runPipeline(
  source: CrawlerSource,
  options: { maxResults?: number; qualityThreshold?: number; dryRun?: boolean } = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const maxResults = options.maxResults ?? 200;
  const qualityThreshold = options.qualityThreshold ?? 5;

  const result: PipelineResult = {
    source: source.name,
    found: 0,
    newWorkflows: 0,
    duplicatesUrl: 0,
    duplicatesContent: 0,
    duplicatesTitle: 0,
    errors: 0,
    errorDetail: [],
    durationMs: 0,
    tokensInput: 0,
    tokensOutput: 0,
    estimatedCostUsd: 0,
  };

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const useAI = !!anthropicKey;

  if (!useAI) {
    console.log(`[Pipeline] Mode sans IA — workflows indexés avec données brutes de ${source.name}`);
  }

  // 1. Crawl
  let rawWorkflows: RawWorkflow[];
  try {
    rawWorkflows = await source.crawl(maxResults);
    result.found = rawWorkflows.length;
    console.log(`[Pipeline] ${source.name}: ${rawWorkflows.length} workflows trouvés`);
  } catch (err) {
    result.errors = 1;
    result.errorDetail.push(`Crawl error: ${String(err)}`);
    result.durationMs = Date.now() - startTime;
    return result;
  }

  if (rawWorkflows.length === 0) {
    result.durationMs = Date.now() - startTime;
    return result;
  }

  // Get pipeline user for author_id
  let pipelineUserId: string;
  try {
    const user = await prisma.user.findFirst({ where: { email: 'pipeline@fluxteka.com' } });
    pipelineUserId = user?.id || '';
    if (!pipelineUserId) {
      const created = await prisma.user.create({
        data: { email: 'pipeline@fluxteka.com', name: 'Fluxteka Pipeline', role: 'seller', email_verified: true },
      });
      pipelineUserId = created.id;
    }
  } catch {
    result.errors = 1;
    result.errorDetail.push('Cannot find/create pipeline user — DB might not be connected');
    result.durationMs = Date.now() - startTime;
    return result;
  }

  // 2. Process each workflow
  for (const raw of rawWorkflows) {
    try {
      // ── Dedup Level 1: URL ──
      const normalizedUrl = normalizeUrl(raw.url);
      const existingUrl = await prisma.crawledUrl.findFirst({ where: { url_normalized: normalizedUrl } });
      if (existingUrl) {
        result.duplicatesUrl++;
        continue;
      }

      // ── Dedup Level 2: Content fingerprint ──
      const fingerprint = contentFingerprint(raw.rawContent);
      const existingContent = await prisma.crawledUrl.findFirst({ where: { content_fingerprint: fingerprint } });
      if (existingContent) {
        result.duplicatesContent++;
        continue;
      }

      // ── Enrich ──
      let enriched: EnrichedWorkflow | null = null;

      if (useAI) {
        const { enriched: aiEnriched, tokensIn, tokensOut, error: enrichError } = await enrichWithClaude(raw, anthropicKey);
        result.tokensInput += tokensIn;
        result.tokensOutput += tokensOut;

        if (!aiEnriched || enrichError) {
          // Fallback to raw enrichment if AI fails
          console.warn(`[Pipeline] AI enrichment failed for "${raw.title.substring(0, 40)}": ${enrichError}, using raw data`);
          enriched = enrichFromRaw(raw);
        } else {
          enriched = aiEnriched;
        }
      } else {
        // No AI key — use raw data directly
        enriched = enrichFromRaw(raw);
      }

      // ── Quality gate ──
      if (enriched.quality_score < qualityThreshold) {
        continue; // Skip low-quality workflows silently
      }

      // ── Dedup Level 3: Title similarity ──
      const recentWorkflows = await prisma.workflow.findMany({
        where: { status: { in: ['active', 'pending'] } },
        select: { id: true, title: true },
        take: 500,
        orderBy: { created_at: 'desc' },
      });
      let titleDup = false;
      for (const w of recentWorkflows) {
        if (titleSimilarity(enriched.title, w.title) > 0.85) {
          titleDup = true;
          break;
        }
      }
      if (titleDup) {
        result.duplicatesTitle++;
        // Still record URL as crawled to avoid re-processing
        await prisma.crawledUrl.create({
          data: {
            url: raw.url,
            url_normalized: normalizedUrl,
            content_fingerprint: fingerprint,
            source: source.name,
            status: 'duplicate_title',
          },
        });
        continue;
      }

      if (options.dryRun) {
        result.newWorkflows++;
        continue;
      }

      // ── Insert workflow ──
      const slug = await generateUniqueSlug(enriched.title, prisma as any);

      const workflow = await prisma.workflow.create({
        data: {
          slug,
          title: enriched.title,
          description_fr: enriched.description_fr,
          how_to_use: enriched.how_to_use || null,
          prerequisites: enriched.prerequisites || null,
          tool: raw.tool,
          // SQLite: store arrays as JSON strings
          tools_connected: JSON.stringify(enriched.tools_connected),
          category: enriched.category,
          tags: JSON.stringify(enriched.tags),
          source_url: raw.url,
          source_type: raw.sourceType,
          source_stars: raw.sourceStars || 0,
          source_views: raw.sourceViews || 0,
          author_id: pipelineUserId,
          score_total: enriched.quality_score,
          raw_content: raw.rawContent.substring(0, 10000),
          indexing_source: source.name,
          status: 'active',
        },
      });

      // ── Record crawled URL ──
      await prisma.crawledUrl.create({
        data: {
          url: raw.url,
          url_normalized: normalizedUrl,
          content_fingerprint: fingerprint,
          source: source.name,
          workflow_id: workflow.id,
          status: 'indexed',
        },
      });

      result.newWorkflows++;
    } catch (err) {
      result.errors++;
      result.errorDetail.push(`Process error "${raw.title?.substring(0, 40)}": ${String(err).substring(0, 200)}`);
    }
  }

  // ── Cost estimation (Claude Haiku pricing: $0.25/1M input, $1.25/1M output) ──
  result.estimatedCostUsd = (result.tokensInput * 0.25 + result.tokensOutput * 1.25) / 1_000_000;
  result.durationMs = Date.now() - startTime;

  // ── Log to DB ──
  try {
    await prisma.pipelineLog.create({
      data: {
        source: source.name,
        status: result.errors > 0 ? 'partial' : 'success',
        found: result.found,
        new: result.newWorkflows,
        duplicates_url: result.duplicatesUrl,
        duplicates_content: result.duplicatesContent,
        duplicates_title: result.duplicatesTitle,
        errors: result.errors,
        error_detail: result.errorDetail.length > 0 ? result.errorDetail.join('\n') : null,
        duration_ms: result.durationMs,
        tokens_input: result.tokensInput,
        tokens_output: result.tokensOutput,
        estimated_cost_usd: result.estimatedCostUsd,
      },
    });
  } catch {
    // Logging failure should not break the pipeline
  }

  console.log(`[Pipeline] ${source.name} terminé: ${result.newWorkflows} nouveaux, ${result.duplicatesUrl + result.duplicatesContent + result.duplicatesTitle} doublons, ${result.errors} erreurs (${result.durationMs}ms)`);

  return result;
}
