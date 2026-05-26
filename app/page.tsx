'use client';

// Force dynamic rendering since this page fetches from /api/trending and /api/stats
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Globe, Gift, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import WorkflowCard, { type WorkflowData } from '@/components/workflows/WorkflowCard';
import { SkeletonGrid } from '@/components/shared/SkeletonCard';
import { useTranslations } from 'next-intl';

// ── Data ──────────────────────────────────────────────────────────────────────

const suggestions = [
  { emoji: '📧', label: 'Email auto', query: 'email automatisation' },
  { emoji: '💰', label: 'Notifier Stripe', query: 'stripe notification' },
  { emoji: '📝', label: 'Publier LinkedIn', query: 'linkedin publication' },
  { emoji: '🤖', label: 'Résumer PDF', query: 'résumer pdf ia' },
  { emoji: '📊', label: 'Rapport auto', query: 'rapport automatique' },
];

const categories = [
  { emoji: '🎯', label: 'Ventes & Prospection',  slug: 'sales-prospection',  color: 'from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400' },
  { emoji: '📣', label: 'Marketing & Contenu',   slug: 'marketing-content',  color: 'from-purple-50 to-violet-50 border-purple-200 hover:border-purple-400' },
  { emoji: '🤖', label: 'Agents IA',             slug: 'ai-agents',          color: 'from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400' },
  { emoji: '⚙️', label: 'Opérations',            slug: 'operations',         color: 'from-slate-50 to-gray-50 border-slate-200 hover:border-slate-400' },
  { emoji: '🤝', label: 'Relation Client',        slug: 'customer-success',   color: 'from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-400' },
  { emoji: '📊', label: 'Data & Analytics',       slug: 'data-analytics',     color: 'from-cyan-50 to-sky-50 border-cyan-200 hover:border-cyan-400' },
  { emoji: '🛒', label: 'E-commerce',             slug: 'ecommerce',          color: 'from-rose-50 to-pink-50 border-rose-200 hover:border-rose-400' },
  { emoji: '💰', label: 'Finance & Admin',         slug: 'finance-admin',      color: 'from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-400' },
];

const platforms = [
  {
    slug: 'n8n',
    name: 'n8n',
    emoji: '🔶',
    tagline: 'Open-source & self-hosted',
    color: 'from-orange-50 to-red-50',
    border: 'border-orange-200 hover:border-orange-400',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    commission: '30% affilié',
  },
  {
    slug: 'make',
    name: 'Make',
    emoji: '🟣',
    tagline: 'Visuel & puissant',
    color: 'from-purple-50 to-violet-50',
    border: 'border-purple-200 hover:border-purple-400',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    commission: '35% affilié',
  },
  {
    slug: 'zapier',
    name: 'Zapier',
    emoji: '⚡',
    tagline: 'Le plus simple',
    color: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200 hover:border-amber-400',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    commission: '8 000+ apps',
  },
  {
    slug: 'langchain',
    name: 'LangChain',
    emoji: '🦜',
    tagline: 'Agents IA avancés',
    color: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200 hover:border-emerald-400',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    commission: 'Open-source',
  },
];

const steps = [
  { emoji: '🔍', title: 'Décris ton besoin', description: 'Recherche par mots-clés ou explore les catégories métier.' },
  { emoji: '⚡', title: 'Fluxteka trouve la recette', description: 'Notre moteur indexe les meilleurs workflows du web.' },
  { emoji: '🚀', title: 'Applique ou télécharge', description: 'Utilise directement ou adapte à ton cas en quelques minutes.' },
];

// ── Onboarding profiles ───────────────────────────────────────────────────────

const profiles = [
  {
    id: 'beginner',
    emoji: '🌱',
    title: 'Débutant',
    description: 'Je découvre l\'automatisation',
    query: '/recherche?tool=zapier&tri=score',
    tip: 'On te recommande de commencer avec Zapier — le plus simple à prendre en main.',
    platform: 'zapier',
  },
  {
    id: 'business',
    emoji: '🏢',
    title: 'PME / Agence',
    description: 'J\'automatise mes process métier',
    query: '/recherche?tool=make&tri=score',
    tip: 'Make est parfait pour les PMEs et agences — puissant et flexible.',
    platform: 'make',
  },
  {
    id: 'developer',
    emoji: '💻',
    title: 'Développeur',
    description: 'Je veux du contrôle et de la flexibilité',
    query: '/recherche?tool=n8n&tri=score',
    tip: 'n8n est fait pour toi — open-source, self-hostable, et ultra-puissant.',
    platform: 'n8n',
  },
  {
    id: 'ai',
    emoji: '🤖',
    title: 'Passionné IA',
    description: 'Je construis des agents autonomes',
    query: '/recherche?categorie=ai-agents&tri=score',
    tip: 'LangChain et les agents IA n8n sont tes meilleurs alliés.',
    platform: 'langchain',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const tHero = useTranslations('hero');
  const tSug = useTranslations('suggestions');
  const tStats = useTranslations('stats');
  const tOnb = useTranslations('onboarding');
  const tPlat = useTranslations('platforms');
  const tTrend = useTranslations('trending');
  const tCat = useTranslations('categories');
  const tHow = useTranslations('howItWorks');
  const tNews = useTranslations('newsletter');
  const tCta = useTranslations('cta');

  const router = useRouter();
  const [trending, setTrending] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [workflowCount, setWorkflowCount] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  useEffect(() => {
    fetch('/api/trending')
      .then((res) => res.ok ? res.json() : { workflows: [] })
      .then((data) => setTrending(data.workflows || []))
      .catch(() => setTrending([]))
      .finally(() => setLoading(false));

    fetch('/api/stats')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.workflows) setWorkflowCount(data.workflows); })
      .catch(() => {});
  }, []);

  const formattedCount = workflowCount ? workflowCount.toLocaleString('fr-FR') : '—';
  const stats = [
    { value: formattedCount, label: tStats('workflowsIndexed'), icon: Zap },
    { value: '6', label: tStats('platforms'), icon: Globe },
    { value: '100%', label: tStats('free'), icon: Gift },
  ];

  const activeProfile = profiles.find((p) => p.id === selectedProfile);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok || res.status === 409) {
        // 409 = already subscribed — still show success
        setNewsletterSent(true);
      }
    } catch {
      // Fallback: show success anyway (don't block UX on network error)
      setNewsletterSent(true);
    }
  };


  return (
    <div className="min-h-screen">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent-100/30 blur-3xl" />
        </div>

        <div className="container-page relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-1.5 text-sm font-medium text-primary-700 shadow-sm">
              <span>🇪🇺</span>
              {tHero('badge')}
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-center font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {tHero('title1')}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              {' '}{tHero('title2')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-center text-lg text-text-secondary md:text-xl"
          >
            {workflowCount
              ? tHero('subtitleWithCount', { count: formattedCount })
              : tHero('subtitleDefault')}
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-8 max-w-2xl"
          >
            <SearchBar large />
          </motion.div>

          {/* Suggestion chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative z-10 mt-4 flex flex-wrap justify-center gap-2"
          >
            {suggestions.map((s) => (
              <button
                key={s.query}
                onClick={() => router.push(`/recherche?q=${encodeURIComponent(s.query)}`)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-text-secondary transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 cursor-pointer"
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="relative border-y border-border bg-white py-8">
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
        <div className="container-page">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <stat.icon className="h-5 w-5 text-primary-500 mb-1" />
                <span className="text-2xl font-heading font-bold text-text-primary md:text-3xl">{stat.value}</span>
                <span className="text-center text-xs text-text-secondary md:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
      </section>

      {/* ═══════════ ONBOARDING QUIZ "Je suis..." ═══════════ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Je suis…
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Sélectionne ton profil pour des recommandations personnalisées
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {profiles.map((profile, i) => (
              <motion.button
                key={profile.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedProfile(selectedProfile === profile.id ? null : profile.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center transition-all duration-200 hover:shadow-md ${
                  selectedProfile === profile.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-border bg-white hover:border-primary-300'
                }`}
              >
                <span className="text-3xl">{profile.emoji}</span>
                <span className="font-heading font-semibold text-text-primary text-sm">{profile.title}</span>
                <span className="text-xs text-text-secondary leading-tight">{profile.description}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeProfile && (
              <motion.div
                key={activeProfile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 rounded-2xl border border-primary-200 bg-primary-50 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary-900 text-sm">{activeProfile.tip}</p>
                  </div>
                </div>
                <Link
                  href={activeProfile.query}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-[0.98]"
                >
                  Voir les workflows
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════ PLATFORMS ═══════════ */}
      <section className="bg-gray-50 py-12 md:py-16 border-t border-border">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Toutes les plateformes, un seul endroit
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Comparez n8n, Make, Zapier et LangChain pour chaque besoin métier
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {platforms.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/plateforme/${p.slug}`}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border-2 bg-gradient-to-br p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${p.color} ${p.border}`}
                  id={`platform-${p.slug}`}
                >
                  <span className="text-4xl transition-transform group-hover:scale-110">{p.emoji}</span>
                  <div className="text-center">
                    <div className="font-heading font-bold text-text-primary">{p.name}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{p.tagline}</div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.badge}`}>
                    {p.commission}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TRENDING ═══════════ */}
      <section className="relative py-12 md:py-16 bg-white border-t border-border">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-text-primary">{tTrend('title')}</h2>
              <p className="mt-1 text-sm text-text-secondary">{tTrend('subtitle')}</p>
            </div>
            <Link
              href="/recherche?tri=score"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {tTrend('viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <SkeletonGrid count={3} />
          ) : trending.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trending.slice(0, 6).map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <WorkflowCard workflow={w} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-gray-50 p-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-primary-300" />
              <p className="mt-3 text-sm text-text-secondary">
                {tTrend('emptyMessage')}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center sm:hidden">
            <Link
              href="/recherche?tri=score"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Voir tous les workflows <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="bg-gray-50 py-12 md:py-16 border-t border-border">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-heading font-bold text-text-primary text-center">
              Explorer par catégorie
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              Trouve le workflow adapté à ton métier
            </p>
          </motion.div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={`/recherche?categorie=${cat.slug}`}
                  className={`group flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${cat.color}`}
                  id={`category-${cat.slug}`}
                >
                  <span className="text-3xl transition-transform group-hover:scale-110">{cat.emoji}</span>
                  <span className="text-center text-xs font-medium text-text-primary leading-tight">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-12 md:py-16 bg-white border-t border-border">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-heading font-bold text-text-primary text-center">Comment ça marche</h2>
            <p className="mt-2 text-center text-sm text-text-secondary">En 3 étapes simples</p>
          </motion.div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-3xl">
                  {step.emoji}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="font-heading font-semibold text-text-primary">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm text-text-secondary max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white border-t border-border">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 mb-4">
              📬 Newsletter gratuite
            </span>
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Workflow de la semaine
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Chaque semaine, reçois le meilleur workflow du moment — expliqué simplement, applicable immédiatement.
            </p>

            <AnimatePresence mode="wait">
              {newsletterSent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
                >
                  <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-2 font-medium text-emerald-800">Tu es inscrit(e) ! 🎉</p>
                  <p className="mt-1 text-sm text-emerald-700">On t&apos;envoie le prochain workflow dès qu&apos;il est prêt.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleNewsletter}
                  className="mt-6 flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="toi@example.com"
                    className="flex-1 rounded-xl border border-border px-4 py-3 text-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                    id="newsletter-email"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-[0.98] whitespace-nowrap"
                  >
                    Je m&apos;inscris →
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mt-3 text-xs text-text-secondary">
              Gratuit · Pas de spam · Désinscription en 1 clic
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-primary-600 pointer-events-none" />
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-12 md:py-16 pt-20 md:pt-24">
          <div className="container-page text-center">
            <h2 className="text-2xl font-heading font-bold text-white md:text-3xl">
              Prêt à automatiser ?
            </h2>
            <p className="mt-3 text-primary-200">
              Rejoins des professionnels qui gagnent du temps chaque jour.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/recherche"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 active:scale-[0.98]"
              >
                🔍 {tCta('searchWorkflow')}
              </Link>
              <Link
                href="/soumettre"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                📤 {tCta('submitMine')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
