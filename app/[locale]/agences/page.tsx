import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { Search, MapPin, Zap, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annuaire des Agences & Freelances IA — Fluxteka',
  description: 'Trouvez l\'expert idéal pour automatiser votre entreprise. Parcourez notre annuaire d\'agences et freelances spécialisés N8N, Make, Zapier et IA.',
};

// Cache for 1 hour
export const revalidate = 3600;

export default async function AgencesPage() {
  const users = await prisma.user.findMany({
    where: {
      profile_type: { in: ['agency', 'freelance'] },
      is_public_agency: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-border">
        <div className="container-page py-16 text-center">
          <h1 className="font-heading text-4xl font-bold text-text-primary md:text-5xl">
            Trouvez le partenaire idéal
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Découvrez les meilleurs experts en automatisation et IA pour vous accompagner dans votre transformation digitale.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-xl border border-border bg-gray-50 p-3 pl-10 text-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Ex: n8n, Zapier, Make, IA..."
              />
            </div>
            <Link
              href="/rejoindre"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:border-primary-300 transition-colors"
            >
              Je suis expert
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-12">
        {users.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary">L'annuaire vient d'ouvrir !</h3>
            <p className="mt-2 text-text-secondary">Soyez le premier expert à vous inscrire.</p>
            <Link
              href="/rejoindre"
              className="mt-6 inline-block rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700"
            >
              Rejoindre l'annuaire gratuitement
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => {
              const services = user.services_offered ? (typeof user.services_offered === 'string' ? JSON.parse(user.services_offered) : user.services_offered) : [];
              return (
                <div key={user.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-lg font-bold text-white shadow-sm">
                          {user.company_name ? user.company_name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-text-primary">{user.company_name || user.name}</h3>
                        <p className="text-xs text-text-secondary capitalize">{user.profile_type}</p>
                      </div>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <p className="mt-4 text-sm text-text-secondary line-clamp-3 leading-relaxed">
                      {user.bio}
                    </p>
                  )}

                  {services && Array.isArray(services) && services.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {services.map((s: string) => (
                        <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-text-secondary">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
                    <div className="text-xs font-medium text-text-primary">
                      {user.hourly_rate ? `À partir de ${user.hourly_rate}€ / h` : 'Sur devis'}
                    </div>
                    {user.website_url && (
                      <a
                        href={user.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        Contacter <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
