import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const ReviewSchema = z.object({
  workflow_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  // user_id intentionally NOT accepted from body — derived from session
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ReviewSchema.parse(body);

    // Get user from session or use anonymous fallback
    const authUser = await getAuthUser(request);
    let userId: string;

    if (authUser) {
      const dbUser = await prisma.user.findUnique({
        where: { email: authUser.email! },
        select: { id: true },
      });
      userId = dbUser?.id ?? '';
    } else {
      // Anonymous review — use a shared anonymous user
      let anonUser = await prisma.user.findFirst({ where: { email: 'anonymous@Fluxteka.fr' } });
      if (!anonUser) {
        anonUser = await prisma.user.create({
          data: { email: 'anonymous@Fluxteka.fr', name: 'Anonyme', role: 'buyer', email_verified: false },
        });
      }
      userId = anonUser.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 400 });
    }

    // Prevent duplicate reviews from same authenticated user
    if (authUser) {
      const existing = await prisma.review.findFirst({
        where: { workflow_id: data.workflow_id, user_id: userId },
      });
      if (existing) {
        return NextResponse.json({ error: 'Tu as déjà laissé un avis sur ce workflow.' }, { status: 409 });
      }
    }

    const review = await prisma.review.create({
      data: { ...data, user_id: userId },
    });

    // Recalculate user score for the workflow
    const allReviews = await prisma.review.findMany({
      where: { workflow_id: data.workflow_id },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    const scoreUsers = Math.min(10, avgRating * 2);

    await prisma.workflow.update({
      where: { id: data.workflow_id },
      data: { score_users: scoreUsers },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues ?? error.format() }, { status: 400 });
    }
    console.error('[API /reviews]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
