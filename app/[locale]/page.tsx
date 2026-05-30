import { prisma } from '@/lib/prisma';
import HomePageClient from '@/components/home/HomePageClient';

// Cache the page for 1 hour
export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = 'fr' } = await params;

  // Fetch data on the server
  const [workflowCount, trendingWorkflows] = await Promise.all([
    prisma.workflow.count({ where: { status: 'active' } }),
    prisma.workflow.findMany({
      where: { status: 'active' },
      orderBy: { score_total: 'desc' },
      take: 6,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    }),
  ]);

  // Safely parse JSON strings to arrays — bare JSON.parse would crash the page on corrupt data
  const safeParse = (val: unknown): unknown[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { return JSON.parse(val || '[]'); } catch { return []; }
    }
    return [];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedTrending = trendingWorkflows.map((w: any) => ({
    ...w,
    tags: safeParse(w.tags),
    tools_connected: safeParse(w.tools_connected),
    // Resolve description for current locale
    description_fr:
      locale === 'en' ? (w.description_en || w.description_fr) :
      locale === 'es' ? (w.description_es || w.description_fr) :
      locale === 'de' ? (w.description_de || w.description_fr) :
      w.description_fr,
  }));

  return (
    <HomePageClient 
      initialTrending={parsedTrending} 
      initialWorkflowCount={workflowCount} 
    />
  );
}
