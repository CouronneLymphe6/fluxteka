import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fluxteka.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/recherche`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    // Platform pages — high SEO value
    { url: `${siteUrl}/plateforme/n8n`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/plateforme/make`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/plateforme/zapier`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/plateforme/langchain`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/carte`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/soumettre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/connexion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${siteUrl}/partenaires`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic workflow pages
  let workflowPages: MetadataRoute.Sitemap = [];
  try {
    const workflows = await prisma.workflow.findMany({
      where: { status: 'active' },
      select: { slug: true, updated_at: true },
      orderBy: { updated_at: 'desc' },
      take: 5000, // Sitemap limit per file
    });

    workflowPages = workflows.map((w) => ({
      url: `${siteUrl}/workflow/${w.slug}`,
      lastModified: w.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // DB not connected — static sitemap only
  }

  return [...staticPages, ...workflowPages];
}
