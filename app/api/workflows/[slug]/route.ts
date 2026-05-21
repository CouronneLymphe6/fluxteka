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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

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

    // Increment views async (fire-and-forget)
    prisma.workflow.update({
      where: { slug },
      data: { views: { increment: 1 } },
    }).catch(() => {});

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
        _count: { select: { saved_by: true } },
      },
    });

    const response = {
      ...workflow,
      tags: safeParseJson(workflow.tags),
      tools_connected: toolsConnected,
      similar,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.warn('[API /workflows/[slug]] DB not connected:', error);
    return NextResponse.json({ error: 'Service indisponible' }, { status: 503 });
  }
}
