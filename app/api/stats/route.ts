import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stats — Real-time platform stats
export async function GET() {
  try {
    const [workflowCount, toolCounts] = await Promise.all([
      prisma.workflow.count({ where: { status: 'active' } }),
      prisma.workflow.groupBy({
        by: ['tool'],
        where: { status: 'active' },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      workflows: workflowCount,
      tools: toolCounts.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=900',
      },
    });
  } catch {
    // DB not connected — count demo workflows as baseline
    return NextResponse.json({
      workflows: 6,
      tools: 6,
    });
  }
}
