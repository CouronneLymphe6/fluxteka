import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fluxteka.com';

  // Fetch workflow data for SEO
  try {
    const res = await fetch(`${siteUrl}/api/workflows/${slug}`, {
      next: { revalidate: 3600 }, // Cache 1h
    });

    if (!res.ok) {
      return {
        title: 'Workflow introuvable',
        description: 'Ce workflow n\'existe pas ou a été supprimé.',
      };
    }

    const workflow = await res.json();

    return {
      title: workflow.title,
      description: workflow.description_fr?.substring(0, 160) || `Workflow ${workflow.tool} sur Fluxteka`,
      keywords: [workflow.tool, ...(workflow.tags || []), 'workflow', 'automatisation'],
      openGraph: {
        title: workflow.title,
        description: workflow.description_fr?.substring(0, 160),
        url: `${siteUrl}/workflow/${slug}`,
        type: 'article',
        publishedTime: workflow.created_at,
        authors: [workflow.author?.name || 'Fluxteka'],
        tags: workflow.tags,
      },
      twitter: {
        card: 'summary',
        title: workflow.title,
        description: workflow.description_fr?.substring(0, 160),
      },
      alternates: {
        canonical: `${siteUrl}/workflow/${slug}`,
      },
    };
  } catch {
    return {
      title: 'Workflow',
      description: 'Découvre ce workflow d\'automatisation sur Fluxteka.',
    };
  }
}

export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
