import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q') || '';
  const tool = searchParams.get('tool') || '';
  const category = searchParams.get('categorie') || '';
  const sort = searchParams.get('tri') || 'score';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 24;

  try {
    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      status: 'active',
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description_fr: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (tool) {
      where.tool = { equals: tool };
    }

    if (category) {
      where.category = { equals: category };
    }

    // Build order by
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: Record<string, string>[] = [];
    if (sort === 'score') orderBy.push({ score_total: 'desc' });
    else if (sort === 'recent') orderBy.push({ created_at: 'desc' });
    else if (sort === 'downloads') orderBy.push({ downloads: 'desc' });
    else orderBy.push({ score_total: 'desc' });

    const [total, workflows] = await Promise.all([
      prisma.workflow.count({ where }),
      prisma.workflow.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
    ]);

    // Get locale — query param takes priority (passed by client), fallback to cookie or 'fr'
    const localeParam = searchParams.get('locale');
    const cookieStore = await cookies();
    const locale = localeParam || cookieStore.get('NEXT_LOCALE')?.value || 'fr';

    // Parse JSON string fields back to arrays for frontend
    const parsed = workflows.map((w: any) => ({
      ...w,
      tags: safeParseJson(w.tags),
      tools_connected: safeParseJson(w.tools_connected),
      has_tutorial: !!w.how_to_use,
      description: w[`description_${locale}`] || w.description_fr,
    }));

    return NextResponse.json({
      workflows: parsed,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.warn('[API /workflows] DB error:', error);
    return NextResponse.json({
      workflows: [],
      total: 0,
      page: 1,
      pages: 0,
    });
  }
}

function safeParseJson(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}
