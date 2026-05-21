/**
 * PATCH /api/admin/workflows/[id] — Approuver ou rejeter un workflow
 * DELETE /api/admin/workflows/[id] — Supprimer un workflow
 * Sécurisé par auth + rôle admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return { error: 'Non authentifié', status: 401 as const };

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { role: true },
  }).catch(() => null);

  if (!dbUser || dbUser.role !== 'admin') {
    return { error: 'Accès refusé', status: 403 as const };
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['active', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Status invalide' }, { status: 400 });
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        status,
        verified_at: status === 'active' ? new Date() : undefined,
      },
      select: { id: true, title: true, status: true, slug: true, author_id: true },
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('[API /admin/workflows PATCH]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

  try {
    const { id } = await params;
    await prisma.workflow.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[API /admin/workflows DELETE]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
