import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

const LeadSchema = z.object({
  type: z.enum(['agency_badge', 'premium_waitlist', 'subscriber_waitlist', 'custom_mission']),
  email: z.string().email(),
  name: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  message: z.string().max(2000).optional(),
  budget: z.string().max(50).optional(),
  tool: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, 'smoke-test', 3, 60_000);
    if (rl) return rl;

    const body = await request.json();
    const data = LeadSchema.parse(body);

    const lead = await prisma.smokeTestLead.create({
      data: {
        type: data.type,
        email: data.email,
        name: data.name || null,
        company: data.company || null,
        website: data.website || null,
        message: data.message || null,
        budget: data.budget || null,
        tool: data.tool || null,
      },
    });

    // TODO: Send notification email via Resend when configured

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    console.error('[API /smoke-test]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
