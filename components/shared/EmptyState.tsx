import { Search, AlertTriangle, Inbox, Upload } from 'lucide-react';
import Link from 'next/link';

type Variant = 'no-results' | 'error' | 'empty';

interface EmptyStateProps {
  variant: Variant;
  query?: string;
  onRetry?: () => void;
}

const config: Record<Variant, { icon: React.ReactNode; title: string; description: string; cta?: { label: string; href?: string } }> = {
  'no-results': {
    icon: <Search className="h-12 w-12 text-text-secondary/50" />,
    title: 'Aucun résultat',
    description: 'Essayez de modifier vos critères de recherche ou soumettez ce workflow.',
    cta: { label: '📤 Soumettre ce workflow', href: '/soumettre' },
  },
  error: {
    icon: <AlertTriangle className="h-12 w-12 text-accent-500" />,
    title: 'Une erreur est survenue',
    description: 'Nous n\'avons pas pu charger les résultats. Veuillez réessayer.',
  },
  empty: {
    icon: <Inbox className="h-12 w-12 text-text-secondary/50" />,
    title: 'Aucun contenu',
    description: 'Il n\'y a rien à afficher pour le moment.',
    cta: { label: '📤 Soumettre un workflow', href: '/soumettre' },
  },
};

export default function EmptyState({ variant, query, onRetry }: EmptyStateProps) {
  const c = config[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-gray-50 p-6">{c.icon}</div>
      <h3 className="mt-4 text-lg font-heading font-semibold text-text-primary">
        {variant === 'no-results' && query ? `Aucun résultat pour "${query}"` : c.title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">{c.description}</p>
      <div className="mt-6 flex gap-3">
        {onRetry && variant === 'error' && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700"
          >
            Réessayer
          </button>
        )}
        {c.cta?.href && (
          <Link
            href={c.cta.href}
            className="rounded-lg border border-primary-200 px-5 py-2.5 text-sm font-medium text-primary-600 transition-all hover:bg-primary-50"
          >
            {c.cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
