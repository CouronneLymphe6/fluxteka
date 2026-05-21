/**
 * POST /api/affiliate/click — Enregistre un clic affilié et retourne l'URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
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
    const ipHash = Buffer.from(ip).toString('base64').substring(0, 16);

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
