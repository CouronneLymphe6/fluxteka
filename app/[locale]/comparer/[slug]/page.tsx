import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ArrowRight, CheckCircle, XCircle, Minus, ExternalLink } from 'lucide-react';

// ── Comparison data ───────────────────────────────────────────────────────────

const TOOL_DATA: Record<string, {
  name: string;
  emoji: string;
  tagline: string;
  color: string;
  affiliateUrl: string;
  pricing: string;
  freeTier: string;
  difficulty: string;
  openSource: boolean;
  selfHostable: boolean;
  gdprFriendly: boolean;
  integrations: string;
  bestFor: string[];
  strengths: string[];
  weaknesses: string[];
}> = {
  n8n: {
    name: 'n8n', emoji: '🔶',
    tagline: 'Open-source, self-hosted, technique',
    color: 'from-orange-500 to-red-500',
    affiliateUrl: 'https://n8n.io/?utm_source=fluxteka',
    pricing: 'Gratuit (self-hosted) · Cloud à partir de 20€/mois',
    freeTier: 'Illimité en self-hosted',
    difficulty: 'Intermédiaire → Avancé',
    openSource: true, selfHostable: true, gdprFriendly: true,
    integrations: '400+',
    bestFor: ['Développeurs', 'DevOps', 'Startups tech', 'Self-hosted'],
    strengths: ['100% open-source', 'Données 100% chez vous', 'Agents IA natifs', 'Programme affilié 30%/12 mois'],
    weaknesses: ['Courbe d\'apprentissage élevée', 'Interface complexe', 'Cloud payant'],
  },
  make: {
    name: 'Make', emoji: '🟣',
    tagline: 'Visuel, puissant, pour agences',
    color: 'from-purple-600 to-violet-600',
    affiliateUrl: 'https://www.make.com/en/register?utm_source=fluxteka',
    pricing: 'Gratuit · Pro à partir de 9€/mois',
    freeTier: '1 000 opérations/mois',
    difficulty: 'Débutant → Intermédiaire',
    openSource: false, selfHostable: false, gdprFriendly: false,
    integrations: '1 000+',
    bestFor: ['Agences', 'Freelances', 'PMEs', 'Non-développeurs'],
    strengths: ['Interface la plus puissante', 'Meilleur affilié du secteur (35%)', 'Tarification prévisible', 'Parfait pour workflows complexes'],
    weaknesses: ['Pas open-source', 'Données sur serveurs Make', 'Coûteux à fort volume'],
  },
  zapier: {
    name: 'Zapier', emoji: '⚡',
    tagline: 'Le plus simple, le plus populaire',
    color: 'from-amber-500 to-orange-500',
    affiliateUrl: 'https://zapier.com/?utm_source=fluxteka',
    pricing: 'Gratuit · Pro à partir de 19€/mois',
    freeTier: '100 tâches/mois (très limité)',
    difficulty: 'Débutant',
    openSource: false, selfHostable: false, gdprFriendly: false,
    integrations: '8 000+',
    bestFor: ['Débutants', 'PMEs non-tech', 'Marketing', 'RH'],
    strengths: ['UX la plus simple du marché', '8 000+ intégrations', 'Templates par rôle métier', 'Zapier AI inclus'],
    weaknesses: ['Très cher à l\'usage', 'Pas de programme affilié', 'Moins flexible', 'Données US'],
  },
  notion: {
    name: 'Notion', emoji: '📓',
    tagline: 'L\'espace de travail tout-en-un',
    color: 'from-gray-800 to-gray-900',
    affiliateUrl: 'https://affiliate.notion.so/fluxteka',
    pricing: 'Gratuit · Pro à partir de 8€/mois',
    freeTier: 'Pages illimitées en gratuit',
    difficulty: 'Débutant',
    openSource: false, selfHostable: false, gdprFriendly: true,
    integrations: '100+',
    bestFor: ['Équipes', 'Freelances', 'Startups', 'Étudiants'],
    strengths: ['Interface la plus flexible', 'Bases de données relationnelles', 'Notion AI inclus', 'Affilié 50%/an'],
    weaknesses: ['Peut devenir lent', 'Courbe d\'apprentissage avancé', 'Pas de offline complet'],
  },
  airtable: {
    name: 'Airtable', emoji: '📊',
    tagline: 'La base de données no-code',
    color: 'from-yellow-500 to-orange-500',
    affiliateUrl: 'https://airtable.com/?utm_source=fluxteka',
    pricing: 'Gratuit · Pro à partir de 20€/mois',
    freeTier: '1 000 lignes par base',
    difficulty: 'Débutant → Intermédiaire',
    openSource: false, selfHostable: false, gdprFriendly: false,
    integrations: '1 000+',
    bestFor: ['Marketing', 'Opérations', 'PMEs', 'Agences'],
    strengths: ['Vues multiples (kanban, calendrier…)', 'API très complète', 'Automatisations natives', 'Intégration Make/Zapier/n8n'],
    weaknesses: ['Cher à fort volume', 'Plan gratuit limité (1k lignes)', 'Moins puissant que SQL'],
  },
  pipedream: {
    name: 'Pipedream', emoji: '🟢',
    tagline: 'Serverless pour développeurs',
    color: 'from-green-500 to-teal-600',
    affiliateUrl: 'https://pipedream.com/?utm_source=fluxteka',
    pricing: 'Gratuit · Pro à partir de 19€/mois',
    freeTier: '10 000 événements/mois',
    difficulty: 'Intermédiaire',
    openSource: true, selfHostable: false, gdprFriendly: false,
    integrations: '1 000+',
    bestFor: ['Développeurs', 'Startups', 'DevOps', 'Product Managers'],
    strengths: ['Plan gratuit très généreux', 'Code + no-code', 'Webhooks natifs', 'Serverless'],
    weaknesses: ['Interface moins intuitive', 'Documentation parfois incomplète', 'Moins de templates'],
  },
};

// ── Comparison configs ────────────────────────────────────────────────────────

const COMPARISONS: Record<string, { a: string; b: string; verdict: string; summary: string }> = {
  'n8n-vs-make': {
    a: 'n8n', b: 'make',
    verdict: 'n8n',
    summary: 'N8N gagne pour les équipes tech qui veulent le contrôle total de leurs données. Make gagne pour les agences et freelances qui veulent la puissance sans coder. Si vous êtes développeur ou DevOps → N8N. Si vous êtes agence ou freelance → Make.',
  },
  'zapier-vs-n8n': {
    a: 'zapier', b: 'n8n',
    verdict: 'dépend',
    summary: 'Zapier est le bon choix pour les débutants absolus qui veulent automatiser rapidement sans friction. N8N est le bon choix pour tout le monde qui veut plus de contrôle et moins de coûts. À volume identique, N8N est 5x à 10x moins cher.',
  },
  'zapier-vs-make': {
    a: 'zapier', b: 'make',
    verdict: 'make',
    summary: 'Pour 95% des cas d\'usage, Make est supérieur à Zapier : plus puissant, moins cher, et meilleur programme affilié. Zapier n\'a un avantage que sur le nombre d\'intégrations (8 000 vs 1 000) et la simplicité pour les débutants absolus.',
  },
  'notion-vs-airtable': {
    a: 'notion', b: 'airtable',
    verdict: 'dépend',
    summary: 'Notion est le meilleur choix pour la gestion de connaissance, le wiki, les docs et la collaboration équipe. Airtable est le meilleur choix pour les bases de données structurées, les CRM légers et les pipelines de données. Utilisez les deux en les connectant via Make ou N8N.',
  },
  'make-vs-zapier': {
    a: 'make', b: 'zapier',
    verdict: 'make',
    summary: 'Make domine Zapier sur le rapport qualité/prix, la puissance des workflows et le programme affilié. Zapier reste pertinent uniquement pour sa simplicité extrême et ses 8 000 intégrations.',
  },
  'n8n-vs-pipedream': {
    a: 'n8n', b: 'pipedream',
    verdict: 'n8n',
    summary: 'N8N et Pipedream ciblent tous les deux les développeurs. N8N gagne sur l\'interface visuelle et les agents IA natifs. Pipedream gagne sur la générosité du plan gratuit et la flexibilité du code.',
  },
};

type ComparisonSlug = keyof typeof COMPARISONS;

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const comp = COMPARISONS[slug as ComparisonSlug];
  if (!comp) return { title: 'Comparatif — Fluxteka' };
  const a = TOOL_DATA[comp.a];
  const b = TOOL_DATA[comp.b];
  return {
    title: `${a.name} vs ${b.name} — Comparatif complet 2026 | Fluxteka`,
    description: `Comparatif détaillé ${a.name} vs ${b.name} : prix, intégrations, facilité d'usage, programme affilié. Lequel choisir en 2026 ? Analyse complète et recommandation.`,
    openGraph: {
      title: `${a.name} vs ${b.name} — Lequel choisir en 2026 ?`,
      description: comp.summary,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(COMPARISONS).map(slug => ({ slug }));
}

// ── Criterion row ─────────────────────────────────────────────────────────────

function CriterionRow({ label, valueA, valueB, winnerA }: {
  label: string;
  valueA: string | boolean;
  valueB: string | boolean;
  winnerA?: boolean | null; // true = A wins, false = B wins, null = tie
}) {
  const formatValue = (v: string | boolean) => {
    if (typeof v === 'boolean') return v ? '✅ Oui' : '❌ Non';
    return v;
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 px-4 text-sm font-medium text-gray-700">{label}</td>
      <td className={`py-3 px-4 text-sm text-center ${winnerA === true ? 'font-semibold text-green-700 bg-green-50' : 'text-gray-600'}`}>
        {formatValue(valueA)}
      </td>
      <td className={`py-3 px-4 text-sm text-center ${winnerA === false ? 'font-semibold text-green-700 bg-green-50' : 'text-gray-600'}`}>
        {formatValue(valueB)}
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const comp = COMPARISONS[slug as ComparisonSlug];
  if (!comp) notFound();

  const toolA = TOOL_DATA[comp.a];
  const toolB = TOOL_DATA[comp.b];
  if (!toolA || !toolB) notFound();

  const verdictTool = comp.verdict === 'dépend' ? null :
    comp.verdict === comp.a ? toolA : toolB;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 py-12 md:py-16">
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600">Accueil</Link>
            <span>›</span>
            <Link href="/recherche" className="hover:text-indigo-600">Outils</Link>
            <span>›</span>
            <span className="text-gray-900">{toolA.name} vs {toolB.name}</span>
          </nav>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3 shadow-sm mb-6">
              <span className="text-3xl">{toolA.emoji}</span>
              <span className="text-2xl font-bold text-gray-400">VS</span>
              <span className="text-3xl">{toolB.emoji}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              {toolA.name} <span className="text-gray-400">vs</span> {toolB.name}
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-gray-600">
              Comparatif complet 2026 — Prix, fonctionnalités, facilité d&apos;usage, programme affilié.
              Lequel choisir pour votre business ?
            </p>

            {/* Quick verdict */}
            {verdictTool && (
              <div className={`mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${verdictTool.color} px-6 py-2.5 text-sm font-semibold text-white shadow-md`}>
                🏆 Notre recommandation : {verdictTool.name}
              </div>
            )}
            {!verdictTool && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md">
                🤝 Ça dépend de votre cas d&apos;usage — voir le verdict complet
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TL;DR Cards ──────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2">
            {[toolA, toolB].map((tool, i) => (
              <div key={tool.name} className={`rounded-2xl border-2 p-6 ${i === 0 ? 'border-gray-200' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{tool.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                    <p className="text-sm text-gray-500">{tool.tagline}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">💰 Prix :</span>
                    <span className="font-medium text-gray-800">{tool.pricing}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">🆓 Gratuit :</span>
                    <span className="font-medium text-gray-800">{tool.freeTier}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">🔌 Intégrations :</span>
                    <span className="font-medium text-gray-800">{tool.integrations}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">📈 Difficulté :</span>
                    <span className="font-medium text-gray-800">{tool.difficulty}</span>
                  </div>
                </div>
                <a
                  href={tool.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${tool.color} px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Essayer {tool.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ─────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 py-12 md:py-16">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Comparatif détaillé
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100 bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Critère</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">{toolA.emoji} {toolA.name}</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">{toolB.emoji} {toolB.name}</th>
                </tr>
              </thead>
              <tbody>
                <CriterionRow label="Open-source" valueA={toolA.openSource} valueB={toolB.openSource}
                  winnerA={toolA.openSource === toolB.openSource ? null : toolA.openSource} />
                <CriterionRow label="Self-hostable" valueA={toolA.selfHostable} valueB={toolB.selfHostable}
                  winnerA={toolA.selfHostable === toolB.selfHostable ? null : toolA.selfHostable} />
                <CriterionRow label="Conforme RGPD" valueA={toolA.gdprFriendly} valueB={toolB.gdprFriendly}
                  winnerA={toolA.gdprFriendly === toolB.gdprFriendly ? null : toolA.gdprFriendly} />
                <CriterionRow label="Nombre d'intégrations" valueA={toolA.integrations} valueB={toolB.integrations} winnerA={null} />
                <CriterionRow label="Plan gratuit" valueA={toolA.freeTier} valueB={toolB.freeTier} winnerA={null} />
                <CriterionRow label="Difficulté" valueA={toolA.difficulty} valueB={toolB.difficulty} winnerA={null} />
                <CriterionRow label="Idéal pour" valueA={toolA.bestFor.join(', ')} valueB={toolB.bestFor.join(', ')} winnerA={null} />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pros & Cons ──────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container-page">
          <div className="grid gap-8 md:grid-cols-2">
            {[
              { tool: toolA, strengths: toolA.strengths, weaknesses: toolA.weaknesses },
              { tool: toolB, strengths: toolB.strengths, weaknesses: toolB.weaknesses },
            ].map(({ tool, strengths, weaknesses }) => (
              <div key={tool.name}>
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span>{tool.emoji}</span> {tool.name}
                </h3>
                <div className="space-y-3">
                  {strengths.map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
                      <span className="text-sm text-gray-700">{s}</span>
                    </div>
                  ))}
                  {weaknesses.map(w => (
                    <div key={w} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                      <span className="text-sm text-gray-500">{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verdict ──────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-indigo-50 py-12 md:py-16">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Notre verdict — {toolA.name} vs {toolB.name}
          </h2>
          <div className="rounded-2xl border border-indigo-200 bg-white p-6 md:p-8 shadow-sm">
            <p className="text-gray-700 leading-relaxed text-base">
              {comp.summary}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={toolA.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${toolA.color} px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all`}
              >
                <ExternalLink className="h-4 w-4" />
                Essayer {toolA.name}
              </a>
              <a
                href={toolB.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${toolB.color} px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all`}
              >
                <ExternalLink className="h-4 w-4" />
                Essayer {toolB.name}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related comparisons ───────────────────────────────────── */}
      <section className="border-t border-gray-100 py-12">
        <div className="container-page text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Autres comparatifs</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(COMPARISONS)
              .filter(([s]) => s !== slug)
              .map(([s, c]) => {
                const a = TOOL_DATA[c.a];
                const b = TOOL_DATA[c.b];
                return (
                  <Link
                    key={s}
                    href={`/comparer/${s}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md transition-all"
                  >
                    {a?.emoji} {a?.name} vs {b?.emoji} {b?.name}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
}
