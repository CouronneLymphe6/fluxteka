import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partenaires — Fluxteka',
  description: 'Deviens un partenaire certifié Fluxteka. Badge Agence Vérifiée, visibilité prioritaire, et support dédié.',
};

export default function PartenairesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
