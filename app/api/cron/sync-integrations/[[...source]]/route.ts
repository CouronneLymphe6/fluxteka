/**
 * app/api/cron/sync-integrations/[[...source]]/route.ts
 * Cron Vercel — Synchronisation automatique des intégrations API
 *
 * Planification : toutes les 24h (voir vercel.json)
 * Sécurité : Bearer CRON_SECRET requis
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncZapier, syncMake, syncN8n } from '@/lib/integrations/sync';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min max (Vercel Pro)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source?: string[] }> }
) {
  // Authentification cron
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error('[Cron] CRON_SECRET is not defined in environment variables');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const sourceParam = resolvedParams.source?.[0]; // 'zapier', 'make', etc.
  const source = sourceParam || request.nextUrl.searchParams.get('source') || 'all';
  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  console.log(`[Cron sync-integrations] Démarrage — source: ${source}`);

  // ─── Zapier ───────────────────────────────────────────────
  if (source === 'all' || source === 'zapier') {
    try {
      const result = await syncZapier(prisma as any, 2000);
      results.zapier = result;
      console.log(`[Cron] Zapier: ${result.inserted} nouveaux, ${result.updated} mis à jour`);
    } catch (err) {
      errors.zapier = String(err);
      console.error('[Cron] Zapier erreur:', err);
    }
  }

  // ─── Make ─────────────────────────────────────────────────
  if (source === 'all' || source === 'make') {
    if (process.env.MAKE_API_TOKEN) {
      try {
        const result = await syncMake(prisma as any, 1500);
        results.make = result;
        console.log(`[Cron] Make: ${result.inserted} nouveaux, ${result.updated} mis à jour`);
      } catch (err) {
        errors.make = String(err);
        console.error('[Cron] Make erreur:', err);
      }
    } else {
      errors.make = 'MAKE_API_TOKEN non configuré';
    }
  }

  // ─── N8n ──────────────────────────────────────────────────
  if (source === 'all' || source === 'n8n') {
    try {
      const result = await syncN8n(prisma as any, 1000);
      results.n8n = result;
      console.log(`[Cron] n8n: ${result.inserted} nouveaux, ${result.updated} mis à jour`);
    } catch (err) {
      errors.n8n = String(err);
      console.error('[Cron] n8n erreur:', err);
    }
  }

  const totalWorkflows = await prisma.workflow.count({ where: { status: 'active' } });

  return NextResponse.json({
    success: Object.keys(errors).length === 0,
    timestamp: new Date().toISOString(),
    source,
    results,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    totalWorkflows,
  });
}
