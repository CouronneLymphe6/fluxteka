import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion — Fluxteka',
  description: 'Connecte-toi à Fluxteka avec Google, GitHub ou un lien magique. Aucun mot de passe requis.',
};

export default function ConnexionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
