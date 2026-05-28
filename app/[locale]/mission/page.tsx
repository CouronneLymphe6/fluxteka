import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notre mission — Fluxteka',
  description: 'Fluxteka démocratise l\'automatisation en Europe. Découvre notre vision : rendre les workflows d\'IA accessibles à tous.',
};

const values = [
  { emoji: '🌍', title: 'Européen', desc: 'Basé en France, pensé pour le marché européen. Interface en français, conformité RGPD native.' },
  { emoji: '🆓', title: 'Accessible à tous', desc: 'La base sera toujours gratuite. L\'automatisation ne devrait pas être un luxe.' },
  { emoji: '🤖', title: 'Propulsé par l\'IA', desc: 'Notre pipeline indexe, traduit et enrichit automatiquement les meilleurs workflows du web.' },
  { emoji: '👥', title: 'Communautaire', desc: 'Chaque workflow est noté par la communauté. Les meilleurs remontent naturellement.' },
  { emoji: '🔓', title: 'Open Source First', desc: 'Nous priorisons les outils open source comme N8N, LangChain, CrewAI et Activepieces.' },
  { emoji: '🛡️', title: 'Vie privée', desc: 'Aucune revente de données. Authentification sans mot de passe, export et suppression en un clic.' },
];

const timeline = [
  { date: 'Q2 2026', label: 'Lancement', desc: 'MVP avec workflows indexés, recherche, filtres et pipeline IA.' },
  { date: 'Q3 2026', label: 'Communauté', desc: 'Système d\'avis, badge agence, collections personnalisées.' },
  { date: 'Q4 2026', label: 'Premium', desc: 'Workflows exclusifs, alertes personnalisées, téléchargement direct.' },
  { date: '2027', label: 'Marketplace', desc: 'Vente de workflows premium par des créateurs indépendants.' },
];

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700 py-20 text-white">
        <div className="container-page text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold md:text-5xl">
            Démocratiser l&apos;automatisation en Europe
          </h1>
          <p className="mt-5 text-primary-200 text-lg leading-relaxed">
            Trop de workflows d&apos;automatisation restent cachés sur GitHub, Reddit ou YouTube.
            Fluxteka les trouve, les traduit en français et les rend accessibles à tous.
          </p>
        </div>
      </section>

      {/* Gradient transition */}
      <div className="h-2 bg-gradient-to-b from-primary-700 to-transparent" />

      {/* Values */}
      <section className="py-16">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center">Nos valeurs</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="text-2xl">{v.emoji}</span>
                <h3 className="mt-3 font-heading font-semibold text-text-primary">{v.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="flex justify-center">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
      </div>

      {/* Timeline */}
      <section className="bg-white py-16">
        <div className="container-page max-w-2xl">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center">Roadmap</h2>
          <div className="mt-10 space-y-6">
            {timeline.map((t, i) => (
              <div key={t.date} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-text-secondary'
                  }`}>
                    {i + 1}
                  </div>
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-6">
                  <p className="text-xs font-medium text-primary-600">{t.date}</p>
                  <h3 className="font-heading font-semibold text-text-primary">{t.label}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with smooth transition */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none" />
        <div className="py-16 pt-20">
          <div className="container-page text-center">
            <h2 className="font-heading text-2xl font-bold text-text-primary">
              Prêt à automatiser ?
            </h2>
            <p className="mt-2 text-text-secondary">
              Explore la bibliothèque ou soumets ton propre workflow.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href="/recherche"
                className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
                Explorer les workflows
              </a>
              <a href="/soumettre"
                className="rounded-xl border border-primary-300 px-6 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors">
                Soumettre un workflow
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
