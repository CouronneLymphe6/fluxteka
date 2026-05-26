/**
 * POST /api/reports — Signaler un workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

const ReportSchema = z.object({
  workflow_id: z.string().uuid(),
  reason: z.enum(['duplicate', 'broken', 'spam', 'inappropriate', 'copyright', 'other']),
  details: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit(request, 'reports', 3, 60_000);
    if (rl) return rl;

    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const data = ReportSchema.parse(body);

    const dbUser = await prisma.user.findFirst({ where: { email: user.email! } });
    if (!dbUser) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    // Check if already reported by this user
    const existing = await prisma.report.findFirst({
      where: { workflow_id: data.workflow_id, user_id: dbUser.id },
    });
    if (existing) {
      return NextResponse.json({ error: 'Tu as déjà signalé ce workflow' }, { status: 409 });
    }

    const report = await prisma.report.create({
      data: {
        workflow_id: data.workflow_id,
        user_id: dbUser.id,
        reason: data.reason,
        details: data.details || null,
      },
    });

    // Update workflow report score
    const reportCount = await prisma.report.count({ where: { workflow_id: data.workflow_id } });
    const reportScore = Math.max(0, 10 - reportCount * 2);
    await prisma.workflow.update({
      where: { id: data.workflow_id },
      data: { score_reports: reportScore },
    });

    return NextResponse.json({ success: true, id: report.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    console.error('[API /reports POST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
