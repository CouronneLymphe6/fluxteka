/**
 * GET /api/admin/dashboard — Stats globales pour le dashboard admin
 * Sécurisé par auth + rôle admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // ── Auth guard: admin only ──
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Check admin role in DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { role: true },
  }).catch(() => null);

  if (!dbUser || dbUser.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const [
      totalWorkflows,
      pendingWorkflows,
      activeWorkflows,
      totalUsers,
      totalReviews,
      totalReports,
      unresolvedReports,
      totalLeads,
      pipelineLogs,
      recentWorkflows,
    ] = await Promise.all([
      prisma.workflow.count(),
      prisma.workflow.count({ where: { status: 'pending' } }),
      prisma.workflow.count({ where: { status: 'active' } }),
      prisma.user.count(),
      prisma.review.count(),
      prisma.report.count(),
      prisma.report.count({ where: { resolved: false } }),
      prisma.smokeTestLead.count(),
      prisma.pipelineLog.findMany({
        orderBy: { run_at: 'desc' },
        take: 10,
        select: {
          source: true, status: true, found: true, new: true,
          errors: true, estimated_cost_usd: true, duration_ms: true, run_at: true,
        },
      }),
      prisma.workflow.findMany({
        where: { status: 'pending' },
        orderBy: { created_at: 'desc' },
        take: 50,
        select: {
          id: true, title: true, tool: true, source_type: true,
          category: true, score_total: true, source_url: true, created_at: true,
        },
      }),
    ]);

    const totalCostUsd = pipelineLogs.reduce((s, l) => s + l.estimated_cost_usd, 0);
    const affiliateClicks = await prisma.affiliateClick.count();

    return NextResponse.json({
      stats: {
        totalWorkflows,
        activeWorkflows,
        pendingWorkflows,
        totalUsers,
        totalReviews,
        totalReports,
        unresolvedReports,
        totalLeads,
        totalCostUsd,
        affiliateClicks,
      },
      pipelineLogs,
      pendingModeration: recentWorkflows,
    });
  } catch (error) {
    console.error('[API /admin/dashboard]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
