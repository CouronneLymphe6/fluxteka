/**
 * /api/user/saves — CRUD sauvegardes de workflows
 *
 * GET    → Liste des workflows sauvegardés par l'utilisateur
 * POST   → Sauvegarder un workflow
 * DELETE → Retirer un workflow sauvegardé
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const dbUser = await prisma.user.findFirst({ where: { email: user.email! } });
    if (!dbUser) return NextResponse.json({ saves: [] });

    const saves = await prisma.savedWorkflow.findMany({
      where: { user_id: dbUser.id },
      include: {
        workflow: {
          select: { id: true, slug: true, title: true, tool: true, category: true, score_total: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ saves });
  } catch (error) {
    console.error('[API /user/saves GET]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { workflow_id } = await request.json();
    if (!workflow_id) return NextResponse.json({ error: 'workflow_id requis' }, { status: 400 });

    const dbUser = await prisma.user.findFirst({ where: { email: user.email! } });
    if (!dbUser) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    // Upsert to avoid duplicates
    const save = await prisma.savedWorkflow.upsert({
      where: { user_id_workflow_id: { user_id: dbUser.id, workflow_id } },
      update: {},
      create: { user_id: dbUser.id, workflow_id },
    });

    return NextResponse.json({ saved: true, id: save.id }, { status: 201 });
  } catch (error) {
    console.error('[API /user/saves POST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { workflow_id } = await request.json();
    if (!workflow_id) return NextResponse.json({ error: 'workflow_id requis' }, { status: 400 });

    const dbUser = await prisma.user.findFirst({ where: { email: user.email! } });
    if (!dbUser) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    await prisma.savedWorkflow.deleteMany({
      where: { user_id: dbUser.id, workflow_id },
    });

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error('[API /user/saves DELETE]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
