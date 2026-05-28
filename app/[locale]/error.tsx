'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm max-w-md">
        <h2 className="text-xl font-bold text-red-900 mb-2">
          Oups, une erreur est survenue !
        </h2>
        <p className="text-red-700 mb-6 text-sm">
          Nous n'avons pas pu charger cette page correctement. L'équipe technique a été notifiée.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
