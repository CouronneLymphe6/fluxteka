import type { Metadata } from 'next';
import { ArrowRight, Users, Zap, TrendingUp, CheckCircle, Star, Shield, Clock, ChevronRight } from 'lucide-react';
import AgencyRegistrationForm, { AgencyBenefits, AgencyTestimonials } from '@/components/agences/AgencyRegistrationForm';

export const metadata: Metadata = {
  title: 'Rejoindre le réseau Expert Fluxteka — Agences & Freelances Automatisation',
  description: 'Développez votre activité d\'automatisation. Recevez des missions qualifiées, obtenez le badge Expert Vérifié et accédez à des milliers d\'entreprises cherchant à automatiser.',
};

/**
 * Design system — espacement uniforme
 * ─────────────────────────────────────────────────
 * Section principale   → py-24 (96px) desktop, py-16 mobile
 * Sous-section         → mb-12 (48px)
 * Bloc interne         → gap-6 (24px)
 * Éléments             → gap-3 (12px)
 * Micro-espacement     → gap-1.5 (6px)
 */

const STATS = [
  { value: '1 854+', label: 'Workflows indexés', icon: Zap },
  { value: '100%', label: 'Leads qualifiés', icon: TrendingUp },
  { value: '50+', label: 'Experts actifs', icon: Users },
  { value: '48h', label: 'Délai de réponse', icon: CheckCircle },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tu crées ton profil',
    desc: 'Remplis le formulaire en 5 minutes. Notre équipe vérifie et publie ton profil sous 48h.',
    icon: '🎯',
  },
  {
    step: '02',
    title: 'Tu reçois des leads qualifiés',
    desc: 'Les entreprises qui ont un besoin précis d\'automatisation te contactent directement.',
    icon: '📥',
  },
  {
    step: '03',
    title: 'Tu développes ton activité',
    desc: 'Tu construis ta réputation, accumules les avis et génères des revenus récurrents.',
    icon: '🚀',
  },
];

export default function AgencesPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ═══════════════════════════════════════════════
          HERO — py-24 desktop / py-16 mobile
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-100/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-100/20 blur-3xl" />
        </div>

        <div className="container-page relative py-16 md:py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Star className="h-3.5 w-3.5 fill-indigo-400 text-indigo-400" />
            Réseau Expert Fluxteka — 100% gratuit pour les 50 premiers
          </div>

          {/* Heading */}
          <h1 className="mt-6 font-heading text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl leading-tight">
            Développez votre activité
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              d&apos;automatisation
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
            Rejoignez le réseau d&apos;experts Fluxteka et recevez des missions qualifiées
            directement. Les entreprises viennent à vous — pas l&apos;inverse.
          </p>

          {/* Trust chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              '✅ Leads pré-qualifiés',
              '✅ Zéro commission cachée',
              '✅ Badge Expert Vérifié',
              '✅ Dashboard analytics',
            ].map(item => (
              <span key={item} className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700">
                {item}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#inscription"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-indigo-700 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Rejoindre le réseau gratuitement <ArrowRight className="h-5 w-5" />
            </a>
            <span className="text-sm text-gray-500 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              Formulaire en 5 minutes
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS — py-8 (bande compacte)
      ═══════════════════════════════════════════════ */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-1.5">
                <s.icon className="h-5 w-5 text-indigo-500" />
                <div className="text-2xl font-bold text-gray-900 font-heading">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT — py-16 md:py-24
      ═══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_420px] xl:gap-16">

            {/* ── Left column ── */}
            <div className="space-y-16">

              {/* Benefits */}
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    Pourquoi rejoindre Fluxteka ?
                  </h2>
                  <p className="mt-3 text-gray-500">
                    Une plateforme conçue pour les experts, pas pour les plateformes.
                  </p>
                </div>
                <AgencyBenefits />
              </div>

              {/* Testimonials */}
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    Ce qu&apos;en disent nos experts
                  </h2>
                  <p className="mt-3 text-gray-500">
                    Rejoins une communauté d&apos;experts qui développent leur activité avec Fluxteka.
                  </p>
                </div>
                <AgencyTestimonials />
              </div>

              {/* Launch offer */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
                    ⏳
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Offre de lancement</h3>
                    <p className="mt-1.5 text-sm text-amber-800 leading-relaxed">
                      Les <strong>50 premiers experts</strong> inscrits bénéficient d&apos;un accès complet gratuit pendant 6 mois.
                      Après le lancement, l&apos;abonnement sera de 99€/mois. Plus que quelques places disponibles.
                    </p>
                    <a href="#inscription" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-900">
                      Réserver ma place <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right column : Registration form (sticky) ── */}
            <div id="inscription" className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Dépose ta candidature</h2>
                  <p className="mt-1.5 text-sm text-gray-500">
                    Notre équipe te répond sous 48h ouvrées.
                  </p>
                </div>
                <AgencyRegistrationForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — py-16 md:py-24
      ═══════════════════════════════════════════════ */}
      <section className="border-t border-gray-100 bg-white py-16 md:py-24">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Comment ça fonctionne</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              De la candidature à la première mission — en moins d&apos;une semaine.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative rounded-2xl border border-gray-100 bg-gray-50 p-6">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-3 md:block">
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>
                )}
                <div className="text-2xl mb-4">{item.icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TRUST FOOTER — py-12
      ═══════════════════════════════════════════════ */}
      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="container-page text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-medium text-gray-700">Garanties Fluxteka</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>🔒 Aucun accès à vos clients</span>
            <span>💳 Facturation transparente</span>
            <span>🇪🇺 Données hébergées en Europe</span>
            <span>✉️ Résiliation à tout moment</span>
          </div>
        </div>
      </section>

    </div>
  );
}
