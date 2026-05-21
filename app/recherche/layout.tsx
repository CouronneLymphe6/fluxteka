import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rechercher des workflows — Fluxteka',
  description: 'Explore et filtre 24 000+ workflows d\'automatisation IA gratuits. N8N, Make, Zapier, LangChain — trouve la recette parfaite.',
  openGraph: {
    title: 'Rechercher des workflows — Fluxteka',
    description: 'Explore et filtre 24 000+ workflows d\'automatisation IA gratuits.',
  },
};

export default function RechercheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
