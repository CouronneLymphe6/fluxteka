export function generateWorkflowMetadata(workflow: {
  title: string;
  description_fr: string;
  slug: string;
}) {
  const title = `${workflow.title} — Fluxteka`;
  const description = workflow.description_fr.substring(0, 160);
  return {
    title,
    description,
    openGraph: { title, description, url: `https://fluxteka.com/workflow/${workflow.slug}` },
    alternates: { canonical: `https://fluxteka.com/workflow/${workflow.slug}` },
  };
}

export function generateWorkflowJsonLd(workflow: {
  title: string;
  description_fr: string;
  score_total: number;
  downloads: number;
}, reviewCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: workflow.title,
    description: workflow.description_fr.substring(0, 300),
    applicationCategory: 'BusinessApplication',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(workflow.score_total),
      ratingCount: String(reviewCount || 1),
      bestRating: '10',
      worstRating: '0',
    },
    downloadCount: String(workflow.downloads),
  };
}
