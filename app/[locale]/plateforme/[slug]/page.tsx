import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ExternalLink, Zap, Users, Star, Shield } from 'lucide-react';

// ── Platform data ────────────────────────────────────────────────────────────

const PLATFORMS = {
  n8n: {
    name: 'n8n',
    tagline: 'L\'automatisation open-source pour les développeurs et les équipes tech',
    description: 'n8n est une plateforme d\'automatisation de workflow open-source, puissante et flexible. Idéale pour les équipes tech qui veulent garder le contrôle de leurs données (self-hosted) tout en bénéficiant d\'un écosystème de 400+ intégrations.',
    affiliateUrl: 'https://n8n.io/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-700',
    badgeBg: 'bg-orange-100',
    emoji: '🔶',
    commission: '30% pendant 12 mois',
    freeTier: 'Gratuit en self-hosted',
    difficulty: 'Intermédiaire → Avancé',
    bestFor: ['Développeurs', 'Équipes DevOps', 'Startups tech', 'Self-hosted'],
    pros: [
      'Open-source et self-hostable (données 100% chez toi)',
      'Plus de 400 intégrations natives',
      'Agents IA natifs (LangChain, OpenAI, Gemini)',
      'Communauté très active — 7 000+ templates',
      'Programme affilié généreux (30%/12 mois)',
    ],
    cons: [
      'Courbe d\'apprentissage plus élevée que Zapier',
      'Interface parfois complexe pour les débutants',
      'Cloud payant si tu ne self-hostes pas',
    ],
    stats: [
      { label: 'Intégrations', value: '400+' },
      { label: 'Templates', value: '7 000+' },
      { label: 'Stars GitHub', value: '50k+' },
    ],
  },
  make: {
    name: 'Make',
    tagline: 'L\'automatisation visuelle la plus puissante pour les agences et freelances',
    description: 'Make (ex-Integromat) est la plateforme d\'automatisation visuelle préférée des agences et experts en automation. Son builder drag-and-drop est le plus puissant du marché pour créer des workflows complexes multi-étapes.',
    affiliateUrl: 'https://www.make.com/en/register?utm_source=fluxteka&utm_medium=referral',
    color: 'from-purple-600 to-violet-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-100',
    emoji: '🟣',
    commission: '35% pendant 12 mois',
    freeTier: '1 000 opérations/mois',
    difficulty: 'Débutant → Intermédiaire',
    bestFor: ['Agences', 'Freelances', 'PMEs', 'Non-développeurs'],
    pros: [
      'Interface visuelle la plus intuitive du marché',
      'Tarification prévisible par crédits',
      'Plus de 1 000 applications intégrées',
      'Meilleur programme affilié du secteur (35%/12 mois)',
      'Parfait pour les workflows complexes multi-étapes',
    ],
    cons: [
      'Pas open-source (données sur serveurs Make)',
      'Peut devenir coûteux à fort volume',
      'Moins de contrôle qu\'une solution self-hosted',
    ],
    stats: [
      { label: 'Intégrations', value: '1 000+' },
      { label: 'Templates', value: '2 000+' },
      { label: 'Utilisateurs', value: '500k+' },
    ],
  },
  zapier: {
    name: 'Zapier',
    tagline: 'Le leader mondial de l\'automatisation no-code pour non-techniciens',
    description: 'Zapier est la référence mondiale de l\'automatisation no-code. Avec 8 000+ applications intégrées et une UX pensée pour les débutants, c\'est le point d\'entrée idéal pour automatiser sans coder.',
    affiliateUrl: 'https://zapier.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
    emoji: '⚡',
    commission: 'Pas de programme affilié public',
    freeTier: '100 tâches/mois (très limité)',
    difficulty: 'Débutant',
    bestFor: ['Débutants', 'PMEs non-tech', 'Marketing', 'RH'],
    pros: [
      'UX la plus simple et intuitive du marché',
      '8 000+ applications intégrées (le plus large)',
      'Templates organisés par rôle métier',
      'Zapier AI pour construire des workflows en langage naturel',
      'Support client réactif',
    ],
    cons: [
      'Très cher à l\'usage (100 tasks/mois en gratuit)',
      'Pas de programme affilié public',
      'Moins flexible que n8n ou Make pour les cas complexes',
      'Données uniquement sur les serveurs Zapier',
    ],
    stats: [
      { label: 'Intégrations', value: '8 000+' },
      { label: 'Templates', value: '10 000+' },
      { label: 'Utilisateurs', value: '2,2M+' },
    ],
  },
  langchain: {
    name: 'LangChain',
    tagline: 'Le framework open-source pour construire des agents IA autonomes',
    description: 'LangChain est le framework Python/JavaScript de référence pour construire des applications IA et des agents autonomes. Il permet de connecter des LLMs (GPT-4, Claude, Gemini) à des outils, bases de données et API externes.',
    affiliateUrl: 'https://www.langchain.com/?utm_source=fluxteka&utm_medium=referral',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    emoji: '🦜',
    commission: 'Pas de programme affilié',
    freeTier: 'Open-source & gratuit',
    difficulty: 'Avancé (Python/JS requis)',
    bestFor: ['Développeurs', 'Data Scientists', 'Chercheurs IA', 'Startups IA'],
    pros: [
      'Open-source et gratuit à utiliser',
      'Écosystème le plus riche pour les agents IA',
      'Compatible avec tous les LLMs (OpenAI, Claude, Gemini, Mistral…)',
      'RAG, Agents multi-étapes, Memory, Tools natifs',
      'Communauté massive (GitHub, Discord)',
    ],
    cons: [
      'Requiert des compétences Python/JavaScript',
      'Plus complexe que les solutions no-code',
      'Évolution rapide — documentation parfois en retard',
    ],
    stats: [
      { label: 'Stars GitHub', value: '90k+' },
      { label: 'Intégrations LLM', value: '50+' },
      { label: 'Packages', value: '1 000+' },
    ],
  },
};

type PlatformSlug = keyof typeof PLATFORMS;

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const platform = PLATFORMS[slug as PlatformSlug];
  if (!platform) return { title: 'Plateforme non trouvée — Fluxteka' };
  return {
    title: `Workflows ${platform.name} — Fluxteka`,
    description: platform.description,
  };
}

export function generateStaticParams() {
  return Object.keys(PLATFORMS).map((slug) => ({ slug }));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PlatformPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platform = PLATFORMS[slug as PlatformSlug];
  if (!platform) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={`relative overflow-hidden ${platform.lightBg} border-b ${platform.border}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br ${platform.color} opacity-10 blur-3xl`} />
          <div className={`absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr ${platform.color} opacity-10 blur-3xl`} />
        </div>

        <div className="container-page relative py-12 md:py-20">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/" className="hover:text-primary-600">Accueil</Link>
            <span>›</span>
            <Link href="/recherche" className="hover:text-primary-600">Plateformes</Link>
            <span>›</span>
            <span className={platform.textColor}>{platform.name}</span>
          </nav>

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              {/* Badge */}
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${platform.badgeBg} ${platform.textColor} ${platform.border}`}>
                <span className="text-lg">{platform.emoji}</span>
                {platform.name}
              </span>

              <h1 className="mt-4 font-heading text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
                Workflows {platform.name}
              </h1>
              <p className="mt-3 text-lg text-text-secondary leading-relaxed">
                {platform.tagline}
              </p>

              {/* Quick stats */}
              <div className="mt-6 flex flex-wrap gap-4">
                {platform.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className={`text-2xl font-bold font-heading ${platform.textColor}`}>{stat.value}</span>
                    <span className="text-xs text-text-secondary">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="w-full rounded-2xl border bg-white p-6 shadow-lg md:w-80">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${platform.badgeBg}`}>
                  {platform.emoji}
                </div>
                <div>
                  <div className="font-heading font-semibold text-text-primary">{platform.name}</div>
                  <div className="text-xs text-text-secondary">{platform.freeTier}</div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary-500" />
                  <span className="text-text-secondary">Difficulté : <span className="font-medium text-text-primary">{platform.difficulty}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-text-secondary">Idéal pour : <span className="font-medium text-text-primary">{platform.bestFor.slice(0, 2).join(', ')}</span></span>
                </div>
              </div>
              <a
                href={platform.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${platform.color} px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]`}
              >
                <ExternalLink className="h-4 w-4" />
                Essayer {platform.name}
              </a>
              {platform.commission !== 'Pas de programme affilié public' && platform.commission !== 'Pas de programme affilié' && (
                <p className="mt-2 text-center text-xs text-text-secondary">
                  🤝 Lien partenaire — commission : {platform.commission}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pros & Cons ──────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container-page">
          <h2 className="text-2xl font-heading font-bold text-text-primary text-center mb-10">
            Pourquoi choisir {platform.name} ?
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pros */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="font-heading font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                <span>✅</span> Points forts
              </h3>
              <ul className="space-y-3">
                {platform.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm text-emerald-900">
                    <span className="mt-0.5 text-emerald-500 flex-shrink-0">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            {/* Cons */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-heading font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <span>⚠️</span> Points à considérer
              </h3>
              <ul className="space-y-3">
                {platform.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm text-amber-900">
                    <span className="mt-0.5 text-amber-500 flex-shrink-0">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best for */}
          <div className={`mt-8 rounded-2xl border ${platform.border} ${platform.lightBg} p-6`}>
            <h3 className={`font-heading font-semibold ${platform.textColor} mb-4 flex items-center gap-2`}>
              <Users className="h-5 w-5" />
              {platform.name} est fait pour toi si tu es…
            </h3>
            <div className="flex flex-wrap gap-2">
              {platform.bestFor.map((profile) => (
                <span key={profile} className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${platform.badgeBg} ${platform.textColor} ${platform.border}`}>
                  {profile}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Explore workflows ────────────────────────────────── */}
      <section className="border-t border-border bg-gray-50 py-12 md:py-16">
        <div className="container-page text-center">
          <h2 className="text-2xl font-heading font-bold text-text-primary">
            Explorer les workflows {platform.name}
          </h2>
          <p className="mt-2 text-text-secondary">
            Découvre les meilleures recettes d&apos;automatisation indexées par Fluxteka
          </p>
          <Link
            href={`/recherche?tool=${slug}`}
            className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${platform.color} px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]`}
          >
            Voir tous les workflows {platform.name}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* All platforms */}
          <div className="mt-12">
            <p className="text-sm text-text-secondary mb-4">Comparer avec d&apos;autres plateformes</p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(PLATFORMS).filter(([s]) => s !== slug).map(([s, p]) => (
                <Link
                  key={s}
                  href={`/plateforme/${s}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-primary-300 hover:text-primary-600 hover:shadow-sm"
                >
                  <span>{p.emoji}</span>
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Security / RGPD ──────────────────────────────────── */}
      <section className="py-10 border-t border-border">
        <div className="container-page flex flex-col items-center gap-2 text-center">
          <Shield className="h-6 w-6 text-primary-400" />
          <p className="text-sm text-text-secondary max-w-lg">
            Fluxteka est une bibliothèque européenne indépendante. Nos liens partenaires nous permettent de maintenir ce service <strong>100% gratuit</strong> pour les utilisateurs.
          </p>
        </div>
      </section>
    </div>
  );
}
