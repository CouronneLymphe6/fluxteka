import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// SQLite stores arrays as JSON strings — parse safely
function safeParseJson(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

// Resolve the best available description for a given locale
function resolveDescription(workflow: Record<string, unknown>, locale: string): string {
  const fr = workflow.description_fr as string || '';
  if (locale === 'en') return (workflow.description_en as string) || fr;
  if (locale === 'es') return (workflow.description_es as string) || fr;
  if (locale === 'de') return (workflow.description_de as string) || fr;
  if (locale === 'it') return (workflow.description_it as string) || fr;
  return fr;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = request.nextUrl.searchParams.get('locale') || 'fr';

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, bio: true, github_url: true, website_url: true, role: true },
        },
        reviews: {
          orderBy: { created_at: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: {
          select: { reviews: true, saved_by: true },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow introuvable' }, { status: 404 });
    }

    // Parse JSON string fields → arrays before sending to frontend
    const toolsConnected = safeParseJson(workflow.tools_connected);

    // Fetch similar workflows (same tool OR category, exclude self)
    const similar = await prisma.workflow.findMany({
      where: {
        AND: [
          { slug: { not: slug } },
          { status: 'active' },
          {
            OR: [
              { tool: workflow.tool },
              { category: workflow.category },
            ],
          },
        ],
      },
      orderBy: { score_total: 'desc' },
      take: 3,
      select: {
        id: true, slug: true, title: true, tool: true,
        category: true, score_total: true, views: true,
        description_fr: true,
        description_en: true,
        _count: { select: { saved_by: true } },
      },
    });

    const wfAsRecord = workflow as unknown as Record<string, unknown>;
    const resolvedDescription = resolveDescription(wfAsRecord, locale);

    const response = {
      ...workflow,
      // Override description with locale-resolved version
      description_fr: resolvedDescription,
      tags: safeParseJson(workflow.tags),
      tools_connected: toolsConnected,
      // Translation availability for the UI
      has_translation: {
        en: !!workflow.description_en,
        es: !!workflow.description_es,
        de: !!workflow.description_de,
      },
      similar: similar.map(s => ({
        ...s,
        description_fr: locale === 'en' && s.description_en ? s.description_en : s.description_fr,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.warn('[API /workflows/[slug]] DB not connected:', error);
    return NextResponse.json({ error: 'Service indisponible' }, { status: 503 });
  }
}
