import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soumettre un workflow — Fluxteka',
  description: 'Partage ta recette d\'automatisation avec la communauté. Tous les workflows sont vérifiés avant publication.',
};

export default function SoumettreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
