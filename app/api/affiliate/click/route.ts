/**
 * POST /api/affiliate/click — Enregistre un clic affilié et retourne l'URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, 'affiliate-click', 20, 60_000);
    if (rl) return rl;

    const { tool, workflow_id } = await request.json();

    if (!tool) {
      return NextResponse.json({ error: 'Tool required' }, { status: 400 });
    }

    // Get affiliate link for this tool
    const link = await prisma.affiliateLink.findFirst({
      where: { tool, active: true },
    });

    // Hash IP for privacy
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip + (process.env.CRON_SECRET || 'salt')).digest('hex');

    // Log click
    await prisma.affiliateClick.create({
      data: {
        tool,
        workflow_id: workflow_id || null,
        ip_hash: ipHash,
      },
    });

    return NextResponse.json({
      url: link?.url || `https://${tool}.com`,
      label: link?.label || `Essayer ${tool}`,
    });
  } catch (error) {
    console.error('[API /affiliate/click]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
