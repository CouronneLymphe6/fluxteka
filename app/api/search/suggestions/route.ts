import { NextRequest, NextResponse } from 'next/server';

// GET /api/search/suggestions?q= — Quick title search for autocomplete
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // When DB is connected:
    // const results = await prisma.workflow.findMany({
    //   where: {
    //     status: 'active',
    //     title: { contains: q, mode: 'insensitive' },
    //   },
    //   select: { title: true, category: true, slug: true },
    //   take: 5,
    // });

    return NextResponse.json({ suggestions: [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
