/**
 * POST /api/user/sync — Synchronise un utilisateur Supabase → Prisma
 *
 * Appelé automatiquement à chaque connexion pour s'assurer que l'utilisateur
 * existe dans la base Prisma avec les bonnes métadonnées.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDbConnected } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/emails/resend';

export async function POST(request: NextRequest) {
  try {
    if (!isDbConnected()) {
      return NextResponse.json({ synced: false, reason: 'DB not connected' });
    }

    const user = await getAuthUser(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const meta = user.user_metadata || {};
    const name = meta.name || meta.full_name || user.email.split('@')[0];
    const avatar = meta.avatar_url || meta.picture || null;

    // Check if user already exists
    const existing = await prisma.user.findFirst({ where: { email: user.email } });

    if (existing) {
      // Update avatar if changed (OAuth providers can update it)
      if (avatar && avatar !== existing.avatar) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { avatar },
        });
      }
      return NextResponse.json({ synced: true, isNew: false, userId: existing.id });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name,
        avatar,
        email_verified: true,
      },
    });

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(user.email, name);
    } catch {
      // Email failure should not break sync
    }

    return NextResponse.json({ synced: true, isNew: true, userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('[API /user/sync]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
