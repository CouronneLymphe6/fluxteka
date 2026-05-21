import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Carte de l\'Automatisation — Fluxteka',
  description: 'Explore l\'écosystème complet de l\'automatisation IA avec N8N, Make, Zapier, LangChain, agents et LLMs. La cartographie pédagogique des workflows automatisés.',
};

const TOOLS = [
  {
    name: 'N8N',
    icon: '🔶',
    color: 'from-orange-50 to-amber-50 border-orange-200',
    badge: 'Open source',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    description: 'Outil open source auto-hébergeable. Idéal pour les développeurs et équipes tech qui veulent garder le contrôle.',
    useCases: ['Webhooks complexes', 'Intégrations API custom', 'Self-hosting', 'Traitements de données'],
    url: 'https://n8n.io',
  },
  {
    name: 'Make (ex-Integromat)',
    icon: '🟣',
    color: 'from-purple-50 to-violet-50 border-purple-200',
    badge: 'No-code',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: 'Interface visuelle puissante. Le choix des non-développeurs pour des automatisations avancées.',
    useCases: ['Marketing automation', 'E-commerce', 'CRM sync', 'Rapports automatiques'],
    url: 'https://make.com',
  },
  {
    name: 'Zapier',
    icon: '🟠',
    color: 'from-orange-50 to-red-50 border-orange-200',
    badge: 'Populaire',
    badgeColor: 'bg-orange-100 text-orange-700',
    description: 'Le pionnier du no-code. Facile à prendre en main, 6000+ intégrations. Parfait pour démarrer.',
    useCases: ['Notifications', 'Syncs basiques', 'Lead capture', 'Email triggers'],
    url: 'https://zapier.com',
  },
  {
    name: 'LangChain',
    icon: '🟢',
    color: 'from-emerald-50 to-green-50 border-emerald-200',
    badge: 'IA / Dev',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    description: 'Framework Python/JS pour construire des agents IA avec mémoire, RAG et outils connectés.',
    useCases: ['Agents IA', 'Chatbots', 'RAG (documents)', 'LLM pipelines'],
    url: 'https://langchain.com',
  },
];

const CONCEPTS = [
  {
    title: 'Trigger (Déclencheur)',
    emoji: '⚡',
    description: 'L\'événement qui lance le workflow. Peut être une heure, un webhook, un formulaire ou un email reçu.',
    examples: ['Nouveau lead Calendly', 'Paiement Stripe confirmé', 'Message Slack reçu'],
  },
  {
    title: 'Action',
    emoji: '⚙️',
    description: 'Ce que le workflow fait suite au déclencheur. Peut être chaîné : Action 1 → Action 2 → ...',
    examples: ['Envoyer un email', 'Créer une fiche CRM', 'Générer un PDF'],
  },
  {
    title: 'Condition (Filter)',
    emoji: '🔀',
    description: 'Branchement logique dans le workflow. Si X → faire A, sinon faire B.',
    examples: ['Si pays = France → TVA 20%', 'Si score > 8 → Notifier équipe'],
  },
  {
    title: 'Loop (Boucle)',
    emoji: '🔁',
    description: 'Traiter plusieurs éléments en série ou en parallèle. Ex: traiter chaque ligne d\'un CSV.',
    examples: ['Pour chaque contact → envoyer email', 'Pour chaque produit → mettre à jour stock'],
  },
  {
    title: 'Agent IA',
    emoji: '🤖',
    description: 'Un LLM (GPT, Claude) qui prend des décisions et utilise des outils. La prochaine frontière de l\'automatisation.',
    examples: ['Analyser un PDF et répondre', 'Trier des emails automatiquement', 'Générer des rapports'],
  },
  {
    title: 'Webhook',
    emoji: '🔗',
    description: 'URL que tu fournis à un service externe pour recevoir des données en temps réel quand un événement se produit.',
    examples: ['Stripe → Webhook → N8N', 'GitHub → Webhook → Slack notification'],
  },
];

const LEVELS = [
  { level: '🌱 Débutant', description: 'Automatisations simples entre 2 apps (ex: Gmail → Notion). 0 code requis.', time: '< 30 min' },
  { level: '🌿 Intermédiaire', description: 'Conditions, boucles, transformations de données. Connaissance des APIs utile.', time: '1-3h' },
  { level: '🌳 Avancé', description: 'Multi-étapes, APIs custom, gestion d\'erreurs, webhooks bidirectionnels.', time: '3-10h' },
  { level: '🚀 Expert', description: 'Agents IA, RAG, self-hosting, orchestration de pipelines complexes.', time: 'Continu' },
];

export default function CartePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-900 to-primary-700 py-16 text-white">
        <div className="container-page text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-200 mb-6">
            🗺️ Carte pédagogique
          </span>
          <h1 className="font-heading text-3xl font-bold md:text-5xl">
            L&apos;écosystème de l&apos;automatisation IA
          </h1>
          <p className="mt-4 text-primary-200 max-w-2xl mx-auto md:text-lg">
            Comprends les outils, concepts clés et niveaux de complexité pour choisir la bonne recette d&apos;automatisation.
          </p>
          <Link href="/recherche"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg hover:bg-primary-50 transition-all">
            🔍 Explorer les workflows <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Gradient transition */}
      <div className="h-2 bg-gradient-to-b from-primary-700 to-transparent" />

      {/* Concepts clés */}
      <section className="py-14">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center">Concepts clés</h2>
          <p className="mt-2 text-center text-sm text-text-secondary">Les briques de base de toute automatisation</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CONCEPTS.map((concept) => (
              <div key={concept.title} className="rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-xl">
                    {concept.emoji}
                  </span>
                  <h3 className="font-heading font-semibold text-text-primary">{concept.title}</h3>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">{concept.description}</p>
                <ul className="mt-3 space-y-1">
                  {concept.examples.map(ex => (
                    <li key={ex} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <span className="h-1 w-1 rounded-full bg-primary-400 shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
      </div>

      {/* Tools comparison */}
      <section className="bg-white py-14">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center">Les plateformes</h2>
          <p className="mt-2 text-center text-sm text-text-secondary">Choisir le bon outil selon ton contexte</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {TOOLS.map((tool) => (
              <div key={tool.name}
                className={`rounded-2xl border bg-gradient-to-br p-6 transition-all hover:shadow-md ${tool.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <h3 className="font-heading font-bold text-text-primary">{tool.name}</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm text-text-secondary">{tool.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tool.useCases.map(uc => (
                    <span key={uc} className="rounded-md bg-white/60 px-2.5 py-1 text-xs font-medium text-text-primary backdrop-blur-sm">
                      {uc}
                    </span>
                  ))}
                </div>
                <a href={tool.url} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">
                  Découvrir {tool.name} <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
      </div>

      {/* Difficulty levels */}
      <section className="py-14">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center">Niveaux de complexité</h2>
          <p className="mt-2 text-center text-sm text-text-secondary">Par où commencer selon ton expérience</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((lvl, i) => (
              <div key={lvl.level} className="relative rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="absolute -top-3 left-5 rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  Niveau {i + 1}
                </div>
                <h3 className="mt-2 font-heading font-semibold text-text-primary">{lvl.level}</h3>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed">{lvl.description}</p>
                <p className="mt-3 text-xs font-medium text-primary-600">⏱ {lvl.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-14 text-center">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-white">Prêt à automatiser ?</h2>
          <p className="mt-2 text-primary-200">Explore les workflows prêts à l&apos;emploi.</p>
          <Link href="/recherche"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg hover:bg-primary-50 transition-all">
            🔍 Rechercher un workflow <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
