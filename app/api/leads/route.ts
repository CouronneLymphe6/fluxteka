import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@fluxteka.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { need, email, budget, tool } = body;

    if (!need?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Besoin et email requis' }, { status: 400 });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Auto-categorize the need with simple keyword matching
    const needLower = need.toLowerCase();
    let autoCategory = 'general';
    if (needLower.includes('email') || needLower.includes('mail')) autoCategory = 'email-automation';
    else if (needLower.includes('crm') || needLower.includes('client') || needLower.includes('lead')) autoCategory = 'crm';
    else if (needLower.includes('linkedin') || needLower.includes('twitter') || needLower.includes('réseaux')) autoCategory = 'social-media';
    else if (needLower.includes('facture') || needLower.includes('paiement') || needLower.includes('stripe')) autoCategory = 'finance';
    else if (needLower.includes('notion') || needLower.includes('airtable') || needLower.includes('base')) autoCategory = 'productivity';
    else if (needLower.includes('ia') || needLower.includes('gpt') || needLower.includes('agent') || needLower.includes('ia')) autoCategory = 'ai-automation';
    else if (needLower.includes('rapport') || needLower.includes('analytique') || needLower.includes('data')) autoCategory = 'data-analytics';
    else if (needLower.includes('shopify') || needLower.includes('ecommerce') || needLower.includes('boutique')) autoCategory = 'ecommerce';

    // Save to DB using SmokeTestLead model (exists in schema)
    const lead = await prisma.smokeTestLead.create({
      data: {
        type: 'expert_request',
        email: email.trim(),
        message: need.trim(),
        budget: budget?.trim() || null,
        tool: tool?.trim() || autoCategory,
        notified: false,
        converted: false,
      },
    });

    // Notify admin via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'Fluxteka Leads <noreply@fluxteka.com>',
            to: [ADMIN_EMAIL],
            subject: `🎯 Nouveau lead expert — ${autoCategory}`,
            html: `
              <h2>Nouveau lead "Trouver un expert"</h2>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${email}</td></tr>
                <tr style="background:#f9fafb"><td style="padding:8px;font-weight:bold">Besoin</td><td style="padding:8px">${need}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Budget</td><td style="padding:8px">${budget || 'Non renseigné'}</td></tr>
                <tr style="background:#f9fafb"><td style="padding:8px;font-weight:bold">Catégorie auto</td><td style="padding:8px">${autoCategory}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Lead ID</td><td style="padding:8px">${lead.id}</td></tr>
              </table>
              <p style="margin-top:16px"><a href="https://fluxteka.com/fr/admin" style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none">Voir dans l'admin</a></p>
            `,
          }),
        });
        await prisma.smokeTestLead.update({
          where: { id: lead.id },
          data: { notified: true },
        });
      } catch (emailErr) {
        console.warn('[leads] Email notification failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true, id: lead.id, category: autoCategory });
  } catch (error) {
    console.error('[leads] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET — for admin: list all expert request leads
export async function GET(request: NextRequest) {
  try {
    // Simple auth check — only admin
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET || 'fluxteka-admin-2026';
    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const leads = await prisma.smokeTestLead.findMany({
      where: { type: { in: ['expert_request', 'agency'] } },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    return NextResponse.json({ leads });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
