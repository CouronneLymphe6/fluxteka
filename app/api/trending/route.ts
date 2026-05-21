import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function safeParseJson(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

// GET /api/trending — Top workflows by score
export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { status: 'active' },
      orderBy: { score_total: 'desc' },
      take: 6,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Parse JSON string fields back to arrays
    const parsed = workflows.map((w) => ({
      ...w,
      tags: safeParseJson(w.tags),
      tools_connected: safeParseJson(w.tools_connected),
    }));

    return NextResponse.json(
      { workflows: parsed },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      }
    );
  } catch (error) {
    console.warn('[API /trending] DB error, using demo data:', error);

    // Fallback demo workflows when DB is unavailable
    const demoWorkflows = [
      {
        id: 'demo-1', slug: 'email-stripe-echec-paiement',
        title: 'Notifier par email les paiements Stripe échoués',
        description_fr: 'Surveille les événements Stripe et envoie automatiquement un email de relance au client avec un lien de mise à jour de carte bancaire.',
        tool: 'n8n', category: 'email', tags: ['stripe', 'email', 'paiement', 'relance'],
        status: 'active', score_total: 9.2, views: 1847, downloads: 312,
        created_at: '2026-05-10T10:00:00Z',
        author: { id: 'demo', name: 'Communauté N8N', avatar: null },
      },
      {
        id: 'demo-2', slug: 'linkedin-publication-ia',
        title: 'Publier automatiquement sur LinkedIn avec l\'IA',
        description_fr: 'Génère du contenu LinkedIn professionnel avec Claude, programme les publications et suit les performances.',
        tool: 'make', category: 'content', tags: ['linkedin', 'ia', 'contenu'],
        status: 'active', score_total: 8.7, views: 2103, downloads: 445,
        created_at: '2026-05-08T14:00:00Z',
        author: { id: 'demo', name: 'Communauté Make', avatar: null },
      },
      {
        id: 'demo-3', slug: 'crm-hubspot-sync-contacts',
        title: 'Synchroniser les contacts HubSpot avec Google Sheets',
        description_fr: 'Synchro bidirectionnelle entre HubSpot CRM et Google Sheets. Les modifications se propagent en temps réel.',
        tool: 'zapier', category: 'crm', tags: ['hubspot', 'google sheets', 'crm'],
        status: 'active', score_total: 8.5, views: 1523, downloads: 287,
        created_at: '2026-05-06T09:00:00Z',
        author: { id: 'demo', name: 'Communauté Zapier', avatar: null },
      },
      {
        id: 'demo-4', slug: 'agent-ia-analyse-pdf',
        title: 'Agent IA pour analyser et résumer des PDF',
        description_fr: 'Upload un PDF, l\'agent IA extrait les informations clés, génère un résumé structuré et répond aux questions.',
        tool: 'langchain', category: 'ai-agents', tags: ['ia', 'pdf', 'rag', 'agent'],
        status: 'active', score_total: 9.0, views: 3201, downloads: 621,
        created_at: '2026-05-12T16:00:00Z',
        author: { id: 'demo', name: 'Communauté LangChain', avatar: null },
      },
      {
        id: 'demo-5', slug: 'factures-automatiques-notion',
        title: 'Générer des factures PDF depuis Notion',
        description_fr: 'Transforme les entrées d\'une base Notion en factures PDF professionnelles, numérotées et envoyées par email.',
        tool: 'n8n', category: 'finance', tags: ['notion', 'facture', 'pdf'],
        status: 'active', score_total: 8.3, views: 987, downloads: 198,
        created_at: '2026-05-04T11:00:00Z',
        author: { id: 'demo', name: 'Communauté N8N', avatar: null },
      },
      {
        id: 'demo-6', slug: 'ecommerce-abandon-panier',
        title: 'Relance automatique d\'abandon de panier Shopify',
        description_fr: 'Détecte les paniers abandonnés sur Shopify et envoie une séquence de 3 emails de relance avec code promo.',
        tool: 'make', category: 'ecommerce', tags: ['shopify', 'email', 'ecommerce'],
        status: 'active', score_total: 8.8, views: 1456, downloads: 367,
        created_at: '2026-05-09T08:00:00Z',
        author: { id: 'demo', name: 'Communauté Make', avatar: null },
      },
    ];

    return NextResponse.json(
      { workflows: demoWorkflows },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' } }
    );
  }
}
