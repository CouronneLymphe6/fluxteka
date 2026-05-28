import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium — Fluxteka',
  description: 'Workflows exclusifs, alertes personnalisées, et téléchargement direct. Le plan pour les professionnels de l\'automatisation.',
};

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
