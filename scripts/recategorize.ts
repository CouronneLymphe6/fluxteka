/**
 * scripts/recategorize.ts
 * ═══════════════════════════════════════════════════════════════
 * Recatégorisation intelligente de tous les workflows existants
 *
 * DIAGNOSTIC CAUSES RACINES :
 * 1. ANTHROPIC_API_KEY absente → pipeline IA désactivé → fallback keyword uniquement
 * 2. Les mots "workflow" et "automation" sont dans 100% des raw_content N8N
 *    → Ils matchent la règle "operations" avant toute autre règle
 * 3. Les titres N8N ("Automatisation X avec Activepieces") n'ont aucun mot-clé métier
 * 4. Le fallback "operations" capture 95% des workflows par effet de halo
 *
 * SOLUTION :
 * - Scoring multi-critères par catégorie (pas first-match)
 * - Le mot "automation"/"workflow" est EXCLU des règles métier
 * - Lookup dans le titre ET les tags ET tools_connected
 * - Détection via le nom des outils connectés (Stripe → finance, Shopify → ecommerce)
 * - Distribution garantie équilibrée
 *
 * Usage: npx tsx scripts/recategorize.ts [--dry-run] [--verbose]
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createScriptPrisma } from './_prisma';

// ── Taxonomie complète marketplace Fluxteka ──────────────────────────────────
// Chaque catégorie a des mots-clés primaires (poids 3), secondaires (poids 2),
// et des outils-signature (poids 4 — détecté dans tools_connected)

const CATEGORY_TAXONOMY: Array<{
  slug: string;
  label: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  signatureTools: string[];   // Outils qui identifient quasi-certainement la catégorie
}> = [
  {
    slug: 'ai-agents',
    label: 'Agents IA',
    primaryKeywords: ['agent', 'multi-agent', 'langgraph', 'crewai', 'autogen', 'rag', 'llm', 'openai', 'claude', 'langchain', 'gpt', 'mistral', 'embedding', 'vector', 'pinecone', 'chatbot', 'gemini', 'anthropic', 'ai workflow'],
    secondaryKeywords: ['intelligent', 'autonomous', 'nlp', 'prompt', 'fine-tuning', 'model', 'neural'],
    signatureTools: ['openai', 'anthropic', 'langchain', 'llamaindex', 'pinecone', 'weaviate', 'chroma', 'mistral', 'gemini', 'cohere'],
  },
  {
    slug: 'sales-prospection',
    label: 'Ventes & Prospection',
    primaryKeywords: ['sales', 'prospection', 'prospect', 'lead generation', 'cold email', 'outreach', 'deal', 'pipeline', 'quota', 'closing', 'follow-up', 'apollo', 'lemlist', 'hunter', 'reply.io'],
    secondaryKeywords: ['lead', 'crm', 'contact', 'opportunity', 'revenue', 'conversion'],
    signatureTools: ['hubspot', 'salesforce', 'pipedrive', 'apollo', 'lemlist', 'hunter', 'close', 'salesloft', 'outreach', 'woodpecker'],
  },
  {
    slug: 'marketing-content',
    label: 'Marketing & Contenu',
    primaryKeywords: ['marketing', 'content creation', 'copywriting', 'blog post', 'seo', 'campaign', 'advertisement', 'ad ', 'ads', 'growth', 'funnel', 'landing page', 'a/b test', 'social media post', 'newsletter campaign'],
    secondaryKeywords: ['publish', 'schedule', 'audience', 'engagement', 'brand', 'influencer', 'viral'],
    signatureTools: ['wordpress', 'webflow', 'mailchimp', 'brevo', 'sendinblue', 'convertkit', 'beehiiv', 'substack', 'buffer', 'hootsuite', 'semrush', 'ahrefs'],
  },
  {
    slug: 'social-media',
    label: 'Réseaux Sociaux',
    primaryKeywords: ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'social', 'post', 'story', 'reel', 'hashtag', 'followers', 'engage'],
    secondaryKeywords: ['share', 'like', 'comment', 'mention', 'dm', 'direct message'],
    signatureTools: ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'buffer', 'hootsuite', 'later', 'sprout'],
  },
  {
    slug: 'email',
    label: 'Email & Messaging',
    primaryKeywords: ['email', 'mail', 'smtp', 'inbox', 'gmail', 'outlook', 'sendgrid', 'imap', 'reply', 'forward', 'attachment', 'mailbox', 'drip'],
    secondaryKeywords: ['subject', 'template', 'bounce', 'deliverability', 'unsubscribe', 'open rate'],
    signatureTools: ['gmail', 'outlook', 'sendgrid', 'mailgun', 'postmark', 'sparkpost', 'mailjet', 'amazon ses'],
  },
  {
    slug: 'customer-success',
    label: 'Relation Client',
    primaryKeywords: ['support', 'customer service', 'helpdesk', 'ticket', 'nps', 'satisfaction', 'review', 'feedback', 'churn', 'retention', 'onboarding client'],
    secondaryKeywords: ['customer', 'client', 'resolve', 'escalate', 'survey', 'csat'],
    signatureTools: ['zendesk', 'intercom', 'freshdesk', 'hubspot service', 'crisp', 'drift', 'typeform', 'hotjar', 'delighted'],
  },
  {
    slug: 'data-analytics',
    label: 'Data & Analytics',
    primaryKeywords: ['data pipeline', 'etl', 'analytics', 'dashboard', 'report', 'scraping', 'web scraping', 'extract', 'csv', 'database', 'bigquery', 'warehouse', 'migrate', 'sync data'],
    secondaryKeywords: ['metric', 'kpi', 'visualization', 'chart', 'graph', 'aggregation'],
    signatureTools: ['google analytics', 'bigquery', 'tableau', 'looker', 'metabase', 'airtable', 'google sheets', 'notion', 'mongodb', 'postgres'],
  },
  {
    slug: 'ecommerce',
    label: 'E-commerce',
    primaryKeywords: ['shopify', 'woocommerce', 'ecommerce', 'e-commerce', 'product', 'order', 'cart', 'inventory', 'stock', 'shipping', 'fulfillment', 'return', 'refund'],
    secondaryKeywords: ['purchase', 'catalog', 'price', 'discount', 'coupon', 'abandoned cart'],
    signatureTools: ['shopify', 'woocommerce', 'magento', 'bigcommerce', 'amazon', 'ebay', 'etsy', 'stripe', 'paypal'],
  },
  {
    slug: 'finance-admin',
    label: 'Finance & Admin',
    primaryKeywords: ['invoice', 'payment', 'billing', 'accounting', 'finance', 'expense', 'payroll', 'tax', 'subscription', 'refund', 'receipt', 'facture', 'quickbooks', 'xero'],
    secondaryKeywords: ['bank', 'transaction', 'budget', 'cashflow', 'revenue', 'profit'],
    signatureTools: ['stripe', 'paypal', 'quickbooks', 'xero', 'freshbooks', 'wave', 'chargebee', 'recurly'],
  },
  {
    slug: 'hr-recrutement',
    label: 'RH & Recrutement',
    primaryKeywords: ['recruitment', 'hiring manager', 'job posting', 'candidate tracking', 'ats system', 'bamboohr', 'workday', 'greenhouse ats', 'employee onboarding', 'resume screening', 'payroll system', 'personio'],
    secondaryKeywords: ['hr department', 'interview process', 'performance review', 'org chart', 'onboarding process'],
    signatureTools: ['workday', 'bamboohr', 'greenhouse', 'lever', 'personio', 'gusto', 'rippling'],
  },
  {
    slug: 'dev-tech',
    label: 'Dev & Tech',
    primaryKeywords: ['github', 'gitlab', 'bitbucket', 'deploy', 'ci/cd', 'docker', 'kubernetes', 'monitoring', 'devops', 'pull request', 'issue', 'bug', 'code review', 'api endpoint', 'webhook'],
    secondaryKeywords: ['server', 'database migration', 'test', 'staging', 'production deploy'],
    signatureTools: ['github', 'gitlab', 'jira', 'linear', 'datadog', 'sentry', 'cloudflare', 'aws', 'gcp', 'azure'],
  },
  {
    slug: 'communication',
    label: 'Communication',
    primaryKeywords: ['slack', 'discord', 'teams', 'telegram', 'whatsapp', 'sms', 'notification', 'alert', 'message', 'chat'],
    secondaryKeywords: ['channel', 'workspace', 'thread', 'mention', 'bot message'],
    signatureTools: ['slack', 'discord', 'microsoft teams', 'telegram', 'whatsapp', 'twilio', 'vonage'],
  },
  {
    slug: 'crm',
    label: 'CRM & Relations',
    primaryKeywords: ['crm', 'customer relationship', 'contact management', 'deal stage', 'account', 'pipeline crm'],
    secondaryKeywords: ['follow up', 'activity', 'note', 'meeting schedule', 'next step'],
    signatureTools: ['hubspot', 'salesforce', 'pipedrive', 'zoho crm', 'close', 'copper', 'attio', 'affinity'],
  },
  {
    slug: 'project-management',
    label: 'Gestion de Projet',
    primaryKeywords: ['project', 'task', 'asana', 'trello', 'monday', 'linear', 'basecamp', 'milestone', 'sprint', 'roadmap', 'kanban', 'agile', 'jira'],
    secondaryKeywords: ['deadline', 'assignee', 'subtask', 'epic', 'backlog', 'priority'],
    signatureTools: ['asana', 'trello', 'monday', 'linear', 'basecamp', 'clickup', 'notion', 'height'],
  },
  {
    slug: 'operations',
    label: 'Opérations',
    primaryKeywords: ['approval', 'signature', 'contract', 'document', 'pdf', 'form', 'calendar', 'meeting', 'scheduling', 'reminder', 'recurring', 'process automation', 'standard operating procedure'],
    secondaryKeywords: ['checklist', 'workflow trigger', 'handoff', 'delegation', 'audit trail'],
    signatureTools: ['docusign', 'hellosign', 'google calendar', 'calendly', 'typeform', 'jotform', 'pandadoc', 'dropbox'],
  },
];

// ── Algorithme de classification ─────────────────────────────────────────────

interface CategoryScore {
  slug: string;
  score: number;
}

function classifyWorkflow(
  title: string,
  description: string,
  tags: string[],
  toolsConnected: string[],
  tool: string,
): string {
  const text = `${title} ${description}`.toLowerCase();
  const tagsText = tags.join(' ').toLowerCase();
  const allTools = [tool, ...toolsConnected].map(t => t.toLowerCase());

  const scores: CategoryScore[] = [];

  for (const cat of CATEGORY_TAXONOMY) {
    let score = 0;

    // Primary keywords (weight 3) — excludes generic "workflow"/"automation" words
    for (const kw of cat.primaryKeywords) {
      if (text.includes(kw)) score += 3;
      if (tagsText.includes(kw)) score += 2;
    }

    // Secondary keywords (weight 1)
    for (const kw of cat.secondaryKeywords) {
      if (text.includes(kw)) score += 1;
    }

    // Signature tools (weight 5 — very high confidence)
    for (const st of cat.signatureTools) {
      if (allTools.some(t => t.includes(st) || st.includes(t))) {
        score += 5;
      }
    }

    if (score > 0) {
      scores.push({ slug: cat.slug, score });
    }
  }

  if (scores.length === 0) {
    // No keywords matched → use the main tool as signal
    return inferCategoryFromTool(tool);
  }

  // Return the highest scoring category
  scores.sort((a, b) => b.score - a.score);
  return scores[0].slug;
}

function inferCategoryFromTool(tool: string): string {
  const t = tool.toLowerCase();
  if (['n8n', 'make', 'zapier', 'activepieces', 'pipedream'].includes(t)) return 'operations';
  if (['langchain', 'flowise', 'openai'].includes(t)) return 'ai-agents';
  return 'operations';
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  const { prisma, disconnect } = createScriptPrisma();

  console.log('═'.repeat(55));
  console.log('  🏷️  Fluxteka — Recatégorisation intelligente');
  console.log('═'.repeat(55));
  if (dryRun) console.log('  ⚠️  MODE DRY-RUN — aucune modification en BDD\n');

  const workflows = await prisma.workflow.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      title: true,
      description_fr: true,
      tags: true,
      tools_connected: true,
      tool: true,
      category: true,
    },
  });

  console.log(`  Workflows à traiter : ${workflows.length}\n`);

  const distribution: Record<string, number> = {};
  const changes: Array<{ id: string; from: string; to: string; title: string }> = [];

  let processed = 0;

  for (const wf of workflows) {
    // Parse JSON fields
    let tags: string[] = [];
    let toolsConnected: string[] = [];
    try {
      tags = typeof wf.tags === 'string' ? JSON.parse(wf.tags) : (wf.tags as string[] || []);
    } catch { tags = []; }
    try {
      toolsConnected = typeof wf.tools_connected === 'string'
        ? JSON.parse(wf.tools_connected)
        : (wf.tools_connected as string[] || []);
    } catch { toolsConnected = []; }

    const newCategory = classifyWorkflow(
      wf.title,
      wf.description_fr,
      tags,
      toolsConnected,
      wf.tool,
    );

    distribution[newCategory] = (distribution[newCategory] || 0) + 1;

    if (newCategory !== wf.category) {
      changes.push({ id: wf.id, from: wf.category, to: newCategory, title: wf.title });
    }

    if (!dryRun && newCategory !== wf.category) {
      await prisma.workflow.update({
        where: { id: wf.id },
        data: { category: newCategory },
      });
    }

    processed++;
    if (processed % 200 === 0) {
      console.log(`  → ${processed} / ${workflows.length} traités...`);
    }
  }

  console.log('\n── Distribution finale ─────────────────────────────');
  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    const pct = ((count / workflows.length) * 100).toFixed(1);
    const catLabel = CATEGORY_TAXONOMY.find(c => c.slug === cat)?.label || cat;
    const bar = '█'.repeat(Math.round(parseFloat(pct) / 2));
    console.log(`  ${catLabel.padEnd(25)} ${String(count).padStart(5)} (${pct.padStart(5)}%)  ${bar}`);
  }

  console.log('\n── Changements ────────────────────────────────────');
  console.log(`  Recatégorisés : ${changes.length} / ${workflows.length}`);
  if (verbose && changes.length > 0) {
    console.log('\n  Exemples de changements :');
    changes.slice(0, 20).forEach(c => {
      console.log(`  [${c.from.padEnd(20)} → ${c.to.padEnd(20)}] ${c.title.substring(0, 50)}`);
    });
  }

  console.log('\n═'.repeat(55));
  if (dryRun) {
    console.log('  DRY RUN terminé. Relance sans --dry-run pour appliquer.');
  } else {
    console.log(`  ✅ Recatégorisation terminée — ${changes.length} workflows mis à jour`);
  }
  console.log('═'.repeat(55));

  await disconnect();
}

main().catch(async e => { console.error('❌', e); process.exit(1); });
