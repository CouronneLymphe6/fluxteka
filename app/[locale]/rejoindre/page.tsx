import Link from 'next/link';
import { ArrowRight, Briefcase, Zap, CheckCircle, Shield, Globe, Users } from 'lucide-react';

export const metadata = {
  title: 'Devenir Partenaire Fluxteka — Agences et Freelances IA',
  description: 'Rejoignez l\'annuaire gratuit des agences et freelances en automatisation et IA. Trouvez de nouveaux clients.',
};

export default function RejoindrePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white pt-20 pb-16">
        <div className="container-page relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700">
            <Briefcase className="h-4 w-4" /> Pour les Agences et Freelances
          </span>
          <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Devenez le partenaire de <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
              référence en automatisation
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary leading-relaxed">
            Fluxteka est la plus grande bibliothèque européenne de workflows. Rejoignez notre annuaire gratuit et connectez-vous avec des entreprises qui recherchent activement des experts N8N, Make, Zapier et LangChain.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/connexion?role=agency"
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Créer mon profil gratuit <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            🚀 100% gratuit pendant la phase de lancement
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-page">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Pourquoi rejoindre l'annuaire ?
            </h2>
            <p className="mt-4 text-text-secondary">
              Une plateforme conçue pour maximiser votre visibilité B2B.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Globe,
                title: 'Visibilité Européenne',
                desc: 'Soyez visible auprès de milliers d\'entreprises qui cherchent à automatiser leurs processus chaque jour.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Zap,
                title: 'Leads Qualifiés',
                desc: 'Les entreprises qui parcourent Fluxteka ont déjà un besoin identifié (CRM, IA, facturation).',
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                icon: Shield,
                title: 'Crédibilité',
                desc: 'Affichez vos propres workflows sur Fluxteka pour prouver votre expertise technique aux prospects.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow bg-white">
                <div className={`inline-flex rounded-xl p-3 ${f.bg} ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-text-primary">{f.title}</h3>
                <p className="mt-3 text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50 border-y border-border">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                Comment ça marche ?
              </h2>
              <div className="mt-8 space-y-6">
                {[
                  { step: '1', title: 'Créez votre compte', desc: 'Remplissez votre profil d\'agence ou de freelance avec vos outils de prédilection (Make, n8n, etc.).' },
                  { step: '2', title: 'Partagez votre expertise', desc: 'Soumettez vos meilleurs workflows publics pour gagner en visibilité.' },
                  { step: '3', title: 'Recevez des demandes', desc: 'Les entreprises peuvent vous contacter directement via votre profil.' },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">{s.title}</h3>
                      <p className="mt-1 text-text-secondary">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Users className="h-48 w-48 text-primary-500" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="h-16 w-16 rounded-full bg-primary-200"></div>
                  <div>
                    <div className="h-5 w-32 rounded bg-gray-200 mb-2"></div>
                    <div className="h-4 w-24 rounded bg-gray-100"></div>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-4 w-full rounded bg-gray-100"></div>
                  <div className="h-4 w-5/6 rounded bg-gray-100"></div>
                  <div className="h-4 w-4/6 rounded bg-gray-100"></div>
                </div>
                <div className="flex gap-2 pt-4">
                  <span className="h-6 w-16 rounded bg-purple-100"></span>
                  <span className="h-6 w-16 rounded bg-orange-100"></span>
                  <span className="h-6 w-16 rounded bg-emerald-100"></span>
                </div>
                <div className="pt-4 mt-4 border-t border-border">
                  <div className="h-10 w-full rounded bg-primary-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white text-center">
        <div className="container-page">
          <h2 className="font-heading text-3xl font-bold text-text-primary">
            Prêt à trouver de nouveaux clients ?
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            Rejoignez gratuitement l'annuaire européen de l'automatisation. Configurez votre profil en moins de 2 minutes.
          </p>
          <div className="mt-8">
            <Link
              href="/connexion?role=agency"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-primary-700 transition-all"
            >
              Créer mon profil <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
