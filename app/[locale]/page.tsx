import { prisma } from '@/lib/prisma';
import HomePageClient from '@/components/home/HomePageClient';

// Cache the page for 1 hour
export const revalidate = 3600;

export default async function Page() {
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

  // Parse JSON strings to arrays for the client component
  const parsedTrending = trendingWorkflows.map((w: any) => ({
    ...w,
    tags: Array.isArray(w.tags) ? w.tags : (typeof w.tags === 'string' ? JSON.parse(w.tags || '[]') : []),
    tools_connected: Array.isArray(w.tools_connected) ? w.tools_connected : (typeof w.tools_connected === 'string' ? JSON.parse(w.tools_connected || '[]') : []),
  }));

  return (
    <HomePageClient 
      initialTrending={parsedTrending} 
      initialWorkflowCount={workflowCount} 
    />
  );
}
