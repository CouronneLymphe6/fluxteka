import type { Metadata } from 'next';
import { ArrowRight, Users, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import AgencyRegistrationForm, { AgencyBenefits, AgencyTestimonials } from '@/components/agences/AgencyRegistrationForm';

export const metadata: Metadata = {
  title: 'Rejoindre le réseau Expert Fluxteka — Agences & Freelances Automatisation',
  description: 'Développez votre activité d\'automatisation. Recevez des missions qualifiées, obtenez le badge Expert Vérifié et accédez à des milliers d\'entreprises cherchant à automatiser.',
};

const STATS = [
  { value: '1 854', label: 'workflows indexés', icon: Zap },
  { value: '100%', label: 'leads qualifiés', icon: TrendingUp },
  { value: '50+', label: 'experts actifs', icon: Users },
  { value: '48h', label: 'délai de réponse', icon: CheckCircle },
];

export default function AgencesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-purple-100/30 blur-3xl" />
        </div>

        <div className="container-page relative py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            🏆 Réseau Expert Fluxteka — 100% gratuit pour les 50 premiers
          </span>

          <h1 className="mt-6 font-heading text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Développez votre activité
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              d&apos;automatisation
            </span>
          </h1>

          <p className="mt-5 mx-auto max-w-2xl text-lg text-gray-600">
            Rejoignez le réseau d&apos;experts Fluxteka et recevez des missions d&apos;automatisation qualifiées
            directement. Les entreprises viennent à vous — pas l&apos;inverse.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['✅ Leads pré-qualifiés', '✅ Zéro commission cachée', '✅ Badge Expert Vérifié', '✅ Dashboard analytics'].map(item => (
              <span key={item} className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700">
                {item}
              </span>
            ))}
          </div>

          <a
            href="#inscription"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-indigo-700 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Rejoindre le réseau gratuitement <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="mx-auto h-5 w-5 text-indigo-500 mb-1" />
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-16">
        <div className="grid gap-16 lg:grid-cols-2">

          {/* ── Left: Benefits + Testimonials ── */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pourquoi rejoindre Fluxteka ?</h2>
              <AgencyBenefits />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ce qu&apos;en disent nos experts</h2>
              <AgencyTestimonials />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-semibold text-amber-900 mb-2">⏳ Offre de lancement</h3>
              <p className="text-sm text-amber-800">
                Les <strong>50 premiers experts</strong> inscrits bénéficient d&apos;un accès gratuit complet pendant 6 mois.
                Après le lancement, l&apos;abonnement sera de 99€/mois.
              </p>
            </div>
          </div>

          {/* ── Right: Registration form ── */}
          <div id="inscription" className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm h-fit lg:sticky lg:top-24">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Dépose ta candidature</h2>
              <p className="mt-1 text-sm text-gray-500">Notre équipe te répond sous 48h ouvrées.</p>
            </div>
            <AgencyRegistrationForm />
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="border-t border-gray-100 bg-white">
        <div className="container-page py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">Comment ça fonctionne</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Tu crées ton profil', desc: 'Remplis le formulaire ci-dessus. Notre équipe examine et publie ton profil en 48h.' },
              { step: '02', title: 'Tu reçois des leads', desc: 'Les entreprises qui recherchent ton expertise te contactent directement via la plateforme.' },
              { step: '03', title: 'Tu développes ton business', desc: 'Tu gères tes clients, tu construis ta réputation avec les avis, tu scèles avec récurrence.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
