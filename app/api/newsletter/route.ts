import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

import { checkRateLimit } from '@/lib/rateLimit';

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend audience ID — create one in Resend dashboard and set here
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, 'newsletter', 3, 60_000);
    if (rl) return rl;

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // If audience ID is configured, add contact to audience
    if (AUDIENCE_ID) {
      await resend.contacts.create({
        email: email.trim().toLowerCase(),
        audienceId: AUDIENCE_ID,
        unsubscribed: false,
      });
    } else {
      // Fallback: send a welcome confirmation email
      await resend.emails.send({
        from: 'Fluxteka <newsletter@fluxteka.com>',
        to: email.trim().toLowerCase(),
        subject: 'Bienvenue dans la newsletter Fluxteka 🚀',
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #4F46E5; font-size: 24px; margin-bottom: 16px;">
              Bienvenue sur Fluxteka ! 🎉
            </h1>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Tu es inscrit(e) à la newsletter <strong>Workflow de la semaine</strong>.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Chaque semaine, tu recevras le meilleur workflow d'automatisation du moment
              — expliqué simplement, applicable immédiatement.
            </p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="color: #94A3B8; font-size: 12px;">
              Fluxteka — Bibliothèque européenne de l'automatisation et de l'IA
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Newsletter] Error:', error);

    // Handle Resend-specific errors (e.g., already subscribed)
    if (error instanceof Error && error.message?.includes('already')) {
      return NextResponse.json({ success: true }); // Idempotent — already subscribed is OK
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
