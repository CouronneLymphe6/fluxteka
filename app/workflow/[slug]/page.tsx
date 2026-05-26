import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import WorkflowDetailClient from '@/components/workflows/WorkflowDetailClient';
import type { Metadata } from 'next';

// Cache for 1 hour
export const revalidate = 3600;

function safeParseJson(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const workflow = await prisma.workflow.findUnique({
    where: { slug },
    select: { title: true, description_fr: true }
  });

  if (!workflow) {
    return { title: 'Workflow introuvable - Fluxteka' };
  }

  return {
    title: `${workflow.title} - Fluxteka`,
    description: workflow.description_fr.substring(0, 160),
  };
}

export default async function WorkflowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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
    notFound();
  }

  // Parse JSON string fields
  const toolsConnected = safeParseJson(workflow.tools_connected);
  const tags = safeParseJson(workflow.tags);

  // Fetch similar workflows
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

  const parsedWorkflow = {
    ...workflow,
    tags,
    tools_connected: toolsConnected,
    similar,
  };

  return <WorkflowDetailClient initialWorkflow={parsedWorkflow} />;
}
