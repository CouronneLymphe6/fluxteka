/**
 * GET  /api/user/export — Export RGPD de toutes les données utilisateur (JSON)
 * DELETE /api/user — Supprimer le compte et toutes les données
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// ── GET /api/user — Export RGPD ──
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const dbUser = await prisma.user.findFirst({
      where: { email: user.email! },
      include: {
        reviews: { select: { id: true, rating: true, comment: true, created_at: true, workflow_id: true } },
        saved_workflows: { include: { workflow: { select: { slug: true, title: true, tool: true } } } },
        workflows: { select: { id: true, slug: true, title: true, tool: true, created_at: true } },
        reports: { select: { id: true, reason: true, created_at: true, workflow_id: true } },
      },
    });

    if (!dbUser) {
      return NextResponse.json({
        profile: { email: user.email },
        reviews: [],
        saved_workflows: [],
        workflows: [],
        reports: [],
        exported_at: new Date().toISOString(),
      });
    }

    const exportData = {
      profile: {
        email: dbUser.email,
        name: dbUser.name,
        bio: dbUser.bio,
        github_url: dbUser.github_url,
        website_url: dbUser.website_url,
        created_at: dbUser.created_at,
      },
      reviews: dbUser.reviews,
      saved_workflows: dbUser.saved_workflows,
      workflows: dbUser.workflows,
      reports: dbUser.reports,
      exported_at: new Date().toISOString(),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="Fluxteka-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('[API /user GET export]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ── DELETE /api/user — Suppression du compte ──
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const dbUser = await prisma.user.findFirst({ where: { email: user.email! } });

    if (dbUser) {
      // Delete all user data in order (cascade handles some, but be explicit)
      await prisma.savedWorkflow.deleteMany({ where: { user_id: dbUser.id } });
      await prisma.review.deleteMany({ where: { user_id: dbUser.id } });
      await prisma.report.deleteMany({ where: { user_id: dbUser.id } });
      await prisma.affiliateClick.updateMany({
        where: { user_id: dbUser.id },
        data: { user_id: null },
      });
      await prisma.user.delete({ where: { id: dbUser.id } });
    }

    // Note: Supabase user deletion requires admin API (service_role key)
    // The user will be signed out client-side

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[API /user DELETE]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
