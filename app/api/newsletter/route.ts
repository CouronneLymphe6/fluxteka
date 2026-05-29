/**
 * app/api/newsletter/route.ts
 * ═══════════════════════════════════════════════════════════════
 * Newsletter API — Production-ready
 *
 * PROBLÈME CORRIGÉ :
 * - RESEND_AUDIENCE_ID était absent → contacts non stockés
 * - Aucune persistance locale des abonnés
 *
 * SOLUTION :
 * 1. Stockage TOUJOURS en BDD locale (table NewsletterSubscriber)
 *    → source de vérité indépendante de Resend
 * 2. Si RESEND_AUDIENCE_ID configuré → sync vers Resend audiences
 * 3. Email de bienvenue envoyé dans tous les cas (via Resend transactionnel)
 * 4. Double opt-in prêt (token généré, activation via /api/newsletter/confirm)
 * 5. Déduplication : email déjà inscrit → 200 OK silencieux (idempotent)
 * 6. Locale détectée depuis cookies pour segmentation future
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fluxteka.com';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

const WELCOME_EMAIL_HTML = (locale: string) => {
  const isEn = locale === 'en';
  const isEs = locale === 'es';
  const isDe = locale === 'de';

  const subject = isEn ? 'Welcome to Fluxteka! 🚀' :
                  isEs ? '¡Bienvenido a Fluxteka! 🚀' :
                  isDe ? 'Willkommen bei Fluxteka! 🚀' :
                  'Bienvenue sur Fluxteka ! 🚀';

  const body = isEn
    ? `You're now subscribed to the <strong>Workflow of the Week</strong> newsletter. Every week, you'll receive the best automation workflow of the moment — simply explained, immediately applicable.`
    : isEs
    ? `Estás suscrito a la newsletter <strong>Workflow de la Semana</strong>. Cada semana recibirás el mejor workflow de automatización del momento — explicado claramente y aplicable de inmediato.`
    : isDe
    ? `Sie haben den <strong>Workflow der Woche</strong>-Newsletter abonniert. Jede Woche erhalten Sie den besten Automatisierungs-Workflow des Moments — einfach erklärt und sofort anwendbar.`
    : `Tu es inscrit(e) à la newsletter <strong>Workflow de la semaine</strong>. Chaque semaine, tu recevras le meilleur workflow d'automatisation du moment — expliqué simplement, applicable immédiatement.`;

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4338ca 0%,#6366f1 100%);padding:32px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:white;letter-spacing:-0.5px;">
        <span style="color:#a5b4fc;">Flux</span><span style="font-weight:400;">teka</span>
      </div>
      <div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.7);">Bibliothèque européenne de l'automatisation</div>
    </div>
    <!-- Content -->
    <div style="padding:32px;">
      <h1 style="font-size:24px;font-weight:700;color:#1e293b;margin:0 0 16px 0;">${subject}</h1>
      <p style="font-size:16px;color:#475569;line-height:1.7;margin:0 0 24px 0;">${body}</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">
          💡 <strong>${isEn ? 'Tip' : isEs ? 'Consejo' : isDe ? 'Tipp' : 'Astuce'} :</strong>
          ${isEn ? 'In the meantime, explore 1,800+ free automation workflows in our library.' :
            isEs ? 'Mientras tanto, explora más de 1,800 workflows de automatización gratuitos en nuestra biblioteca.' :
            isDe ? 'In der Zwischenzeit können Sie über 1.800 kostenlose Automatisierungs-Workflows in unserer Bibliothek entdecken.' :
            'En attendant, explore nos 1 800+ workflows d\'automatisation gratuits dans la bibliothèque.'}
        </p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${SITE_URL}/recherche" style="display:inline-block;background:linear-gradient(135deg,#4338ca,#6366f1);color:white;text-decoration:none;border-radius:12px;padding:14px 28px;font-weight:600;font-size:15px;">
          ${isEn ? '🔍 Explore workflows' : isEs ? '🔍 Explorar workflows' : isDe ? '🔍 Workflows entdecken' : '🔍 Explorer les workflows'}
        </a>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
      <p style="font-size:12px;color:#94a3b8;margin:0;text-align:center;">
        Fluxteka — ${isEn ? 'The European automation library' : isEs ? 'La biblioteca europea de automatización' : isDe ? 'Die europäische Automatisierungsbibliothek' : 'La bibliothèque européenne de l\'automatisation'}
        <br>Made with ❤️ in Europe · 
        <a href="${SITE_URL}/api/newsletter/unsubscribe?email={{EMAIL}}" style="color:#94a3b8;">
          ${isEn ? 'Unsubscribe' : isEs ? 'Cancelar suscripción' : isDe ? 'Abmelden' : 'Se désinscrire'}
        </a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ──
    const rl = await checkRateLimit(request, 'newsletter', 3, 60_000);
    if (rl) return rl;

    const body = await request.json();
    const { email, source = 'homepage' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Detect locale ──
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr';

    // ── Stockage BDD (toujours, indépendant de Resend) ──
    let subscriber;
    try {
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        if (existing.status === 'unsubscribed') {
          // Re-subscribe
          subscriber = await prisma.newsletterSubscriber.update({
            where: { email: normalizedEmail },
            data: {
              status: 'confirmed',
              unsubscribed_at: null,
              updated_at: new Date(),
            },
          });
        } else {
          // Already subscribed — idempotent
          return NextResponse.json({ success: true });
        }
      } else {
        const token = generateToken();
        subscriber = await prisma.newsletterSubscriber.create({
          data: {
            email: normalizedEmail,
            locale,
            source,
            status: 'confirmed', // Direct opt-in for MVP, token for future double opt-in
            confirmation_token: token,
            confirmed_at: new Date(),
          },
        });
      }
    } catch (dbError) {
      // DB error is non-blocking — still send the email
      console.error('[Newsletter] DB error:', dbError);
    }

    // ── Sync vers Resend Audience (si configuré) ──
    if (AUDIENCE_ID) {
      try {
        const contact = await resend.contacts.create({
          email: normalizedEmail,
          audienceId: AUDIENCE_ID,
          unsubscribed: false,
        });

        // Store Resend contact ID for future use
        if (subscriber && contact.data?.id) {
          await prisma.newsletterSubscriber.update({
            where: { email: normalizedEmail },
            data: { resend_contact_id: contact.data.id },
          }).catch(() => {}); // Non-blocking
        }
      } catch (resendError: unknown) {
        // Resend error is non-blocking (already stored in DB)
        if (!(resendError instanceof Error && resendError.message?.includes('already'))) {
          console.warn('[Newsletter] Resend audience sync failed:', resendError);
        }
      }
    }

    // ── Email de bienvenue ──
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Fluxteka <newsletter@fluxteka.com>',
          to: normalizedEmail,
          subject: locale === 'en' ? 'Welcome to Fluxteka! 🚀' :
                   locale === 'es' ? '¡Bienvenido a Fluxteka! 🚀' :
                   locale === 'de' ? 'Willkommen bei Fluxteka! 🚀' :
                   'Bienvenue sur Fluxteka ! 🚀',
          html: WELCOME_EMAIL_HTML(locale).replace('{{EMAIL}}', encodeURIComponent(normalizedEmail)),
        });
      } catch (emailError) {
        console.warn('[Newsletter] Welcome email failed:', emailError);
        // Non-blocking — subscriber is already in DB
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Newsletter] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

// ── GET /api/newsletter — Admin endpoint: count subscribers ──
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Public: just return count for social proof
    const count = await prisma.newsletterSubscriber.count({ where: { status: 'confirmed' } });
    return NextResponse.json({ confirmed: count });
  }

  const total = await prisma.newsletterSubscriber.count();
  const confirmed = await prisma.newsletterSubscriber.count({ where: { status: 'confirmed' } });
  const unsubscribed = await prisma.newsletterSubscriber.count({ where: { status: 'unsubscribed' } });
  const byLocale = await prisma.newsletterSubscriber.groupBy({
    by: ['locale'],
    _count: true,
    where: { status: 'confirmed' },
  });

  return NextResponse.json({ total, confirmed, unsubscribed, byLocale });
}
