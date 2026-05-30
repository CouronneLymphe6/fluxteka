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

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
  const { slug, locale } = await params;
  const workflow = await prisma.workflow.findUnique({
    where: { slug },
    select: { title: true, description_fr: true, description_en: true, description_es: true, description_de: true }
  });

  if (!workflow) {
    return { title: 'Workflow introuvable - Fluxteka' };
  }

  const description =
    locale === 'en' ? (workflow.description_en || workflow.description_fr) :
    locale === 'es' ? (workflow.description_es || workflow.description_fr) :
    locale === 'de' ? (workflow.description_de || workflow.description_fr) :
    workflow.description_fr;

  return {
    title: `${workflow.title} - Fluxteka`,
    description: description.substring(0, 160),
  };
}

export default async function WorkflowPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale = 'fr' } = await params;

  // Helper to pick the best description for this locale
  function resolveDesc(wf: Record<string, unknown>): string {
    const fr = (wf.description_fr as string) || '';
    if (locale === 'en') return (wf.description_en as string) || fr;
    if (locale === 'es') return (wf.description_es as string) || fr;
    if (locale === 'de') return (wf.description_de as string) || fr;
    return fr;
  }

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
      description_fr: true, description_en: true, description_es: true, description_de: true,
      _count: { select: { saved_by: true } },
    },
  });

  const wfRecord = workflow as unknown as Record<string, unknown>;
  const parsedWorkflow = {
    ...workflow,
    // Override description with locale-resolved version
    description_fr: resolveDesc(wfRecord),
    tags,
    tools_connected: toolsConnected,
    similar: similar.map(s => ({
      ...s,
      description_fr: resolveDesc(s as unknown as Record<string, unknown>),
    })),
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${workflow.title} ${workflow.title.toLowerCase().includes(workflow.tool.toLowerCase()) ? '' : `sur ${workflow.tool}`}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    description: workflow.description_fr,
    offers: {
      '@type': 'Offer',
      price: workflow.price,
      priceCurrency: 'EUR',
    },
    aggregateRating: workflow._count.reviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: (workflow.reviews.reduce((s, r) => s + r.rating, 0) / workflow.reviews.length).toFixed(1),
      ratingCount: workflow._count.reviews,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkflowDetailClient initialWorkflow={parsedWorkflow} />
    </>
  );
}
