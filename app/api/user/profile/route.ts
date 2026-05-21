/**
 * GET /api/user/profile — Récupère le profil utilisateur
 * PUT /api/user/profile — Met à jour le profil
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const dbUser = await prisma.user.findFirst({
      where: { email: user.email! },
      select: {
        id: true, email: true, name: true, avatar: true, bio: true,
        github_url: true, website_url: true, role: true, created_at: true,
        _count: { select: { reviews: true, saved_workflows: true, workflows: true } },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ synced: false, email: user.email });
    }

    return NextResponse.json({ synced: true, user: dbUser });
  } catch (error) {
    console.error('[API /user/profile GET]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { name, bio, website_url, github_url } = body;

    const dbUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        name: name || undefined,
        bio: bio || undefined,
        website_url: website_url || undefined,
        github_url: github_url || undefined,
      },
      create: {
        email: user.email!,
        name: name || user.user_metadata?.name || user.email!.split('@')[0],
        bio: bio || null,
        website_url: website_url || null,
        github_url: github_url || null,
        avatar: user.user_metadata?.avatar_url || null,
        email_verified: true,
      },
    });

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('[API /user/profile PUT]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
