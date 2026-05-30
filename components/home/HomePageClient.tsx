'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Globe, Gift, Sparkles, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import WorkflowCard, { type WorkflowData } from '@/components/workflows/WorkflowCard';
import { SkeletonGrid } from '@/components/shared/SkeletonCard';
import { useTranslations } from 'next-intl';
import NewsletterForm from '@/components/home/NewsletterForm';
import OnboardingQuiz from '@/components/home/OnboardingQuiz';

export default function HomePageClient({ 
  initialTrending, 
  initialWorkflowCount 
}: { 
  initialTrending: WorkflowData[]; 
  initialWorkflowCount: number;
}) {
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
  const [trending] = useState<WorkflowData[]>(initialTrending);
  const [workflowCount] = useState<number>(initialWorkflowCount);
  const loading = false;

  const suggestions = [
    { emoji: '📧', label: tSug('emailAuto'),       query: 'email' },
    { emoji: '💰', label: tSug('notifyStripe'),    query: 'stripe' },
    { emoji: '📝', label: tSug('publishLinkedin'), query: 'linkedin' },
    { emoji: '🤖', label: tSug('summarizePdf'),    query: 'pdf' },
    { emoji: '📊', label: tSug('autoReport'),      query: 'report automation' },
  ];

  const categories = [
    { emoji: '🎯', label: tCat('salesProspection'), slug: 'sales-prospection',  color: 'from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400' },
    { emoji: '📣', label: tCat('marketingContent'), slug: 'marketing-content',  color: 'from-purple-50 to-violet-50 border-purple-200 hover:border-purple-400' },
    { emoji: '🤖', label: tCat('aiAgents'),         slug: 'ai-agents',          color: 'from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400' },
    { emoji: '⚙️', label: tCat('operations'),       slug: 'operations',         color: 'from-slate-50 to-gray-50 border-slate-200 hover:border-slate-400' },
    { emoji: '🤝', label: tCat('customerSuccess'),   slug: 'customer-success',   color: 'from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-400' },
    { emoji: '📊', label: tCat('dataAnalytics'),    slug: 'data-analytics',     color: 'from-cyan-50 to-sky-50 border-cyan-200 hover:border-cyan-400' },
    { emoji: '🛒', label: tCat('ecommerce'),        slug: 'ecommerce',          color: 'from-rose-50 to-pink-50 border-rose-200 hover:border-rose-400' },
    { emoji: '💰', label: tCat('financeAdmin'),     slug: 'finance-admin',      color: 'from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-400' },
  ];

  const platforms = [
    {
      slug: 'n8n',
      name: 'n8n',
      emoji: '🔶',
      tagline: tPlat('n8n.tagline'),
      color: 'from-orange-50 to-red-50',
      border: 'border-orange-200 hover:border-orange-400',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-700',
      commission: 'Open-source',
    },
    {
      slug: 'make',
      name: 'Make',
      emoji: '🟣',
      tagline: tPlat('make.tagline'),
      color: 'from-purple-50 to-violet-50',
      border: 'border-purple-200 hover:border-purple-400',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700',
      commission: tPlat('make.commission'),
    },
    {
      slug: 'zapier',
      name: 'Zapier',
      emoji: '⚡',
      tagline: tPlat('zapier.tagline'),
      color: 'from-amber-50 to-yellow-50',
      border: 'border-amber-200 hover:border-amber-400',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-700',
      commission: tPlat('zapier.commission'),
    },
    {
      slug: 'langchain',
      name: 'LangChain',
      emoji: '🦜',
      tagline: tPlat('langchain.tagline'),
      color: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200 hover:border-emerald-400',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700',
      commission: tPlat('langchain.commission'),
    },
  ];

  const steps = [
    { emoji: '🔍', title: tHow('step1Title'), description: tHow('step1Description') },
    { emoji: '⚡', title: tHow('step2Title'), description: tHow('step2Description') },
    { emoji: '🚀', title: tHow('step3Title'), description: tHow('step3Description') },
  ];

  const formattedCount = workflowCount ? workflowCount.toLocaleString() : '—';
  const stats = [
    { value: formattedCount, label: tStats('workflowsIndexed'), icon: Zap },
    { value: '4', label: tStats('platforms'), icon: Globe },
    { value: '100%', label: tStats('free'), icon: Gift },
    { value: '< 15 min', label: 'Temps d\'installation moyen', icon: Clock },
  ];

  // Le OnboardingQuiz et le NewsletterForm gèrent maintenant leur propre état.


  return (
    <div className="min-h-screen">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white pb-10 pt-8 md:pb-16 md:pt-14">
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
          {/* Ticker — résultats concrets */}
          <div className="mt-5 overflow-hidden rounded-xl border border-primary-100 bg-white/80 backdrop-blur-sm py-2.5">
            <motion.div
              className="flex gap-8 whitespace-nowrap"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            >
              {[
                '✅ +5h/semaine récupérées',
                '✅ Leads qualifiés automatiquement',
                '✅ CRM synchronisé sans effort',
                '✅ Rapports générés à la demande',
                '✅ Emails envoyés automatiquement',
                '✅ Factures créées sans intervention',
                '✅ Slack notifié en temps réel',
                '✅ +5h/semaine récupérées',
                '✅ Leads qualifiés automatiquement',
                '✅ CRM synchronisé sans effort',
                '✅ Rapports générés à la demande',
                '✅ Emails envoyés automatiquement',
                '✅ Factures créées sans intervention',
                '✅ Slack notifié en temps réel',
              ].map((item, i) => (
                <span key={i} className="text-sm font-medium text-primary-700">{item}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="relative border-y border-border bg-white py-8">
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
        <div className="container-page">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
              {tOnb('title')}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {tOnb('subtitle')}
            </p>
          </motion.div>

          <OnboardingQuiz />
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
              {tPlat('title')}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {tPlat('subtitle')}
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
              {tTrend('viewAllWorkflows')} <ArrowRight className="h-4 w-4" />
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
              {tCat('title')}
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
              {tCat('subtitle')}
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
            <h2 className="text-2xl font-heading font-bold text-text-primary text-center">{tHow('title')}</h2>
            <p className="mt-2 text-center text-sm text-text-secondary">{tHow('subtitle')}</p>
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

      {/* ═══════════ SOCIAL PROOF ═══════════ */}
      <section className="py-12 md:py-16 bg-white border-t border-border">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              Ils automatisent avec Fluxteka
            </h2>
            <p className="mt-2 text-sm text-text-secondary">Rejoins des milliers de professionnels qui gagnent du temps</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { name: 'Lucas B.', role: 'Growth Hacker · Paris', avatar: 'L', text: 'En 10 minutes j\'avais mon workflow Stripe → Slack configuré. Ça m\'a économisé une demi-journée de dev.', stars: 5 },
              { name: 'Marie T.', role: 'Directrice Marketing · Bordeaux', avatar: 'M', text: 'La recherche est ultra rapide. J\'ai trouvé un workflow LinkedIn automation que je cherchais depuis des semaines.', stars: 5 },
              { name: 'Kevin D.', role: 'CTO startup · Lyon', avatar: 'K', text: 'La qualité des workflows N8N est vraiment au niveau. Tout est bien documenté et applicable directement.', stars: 5 },
            ].map((item, i) => (
              <motion.div key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">&quot;{item.text}&quot;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-secondary">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA AGENCES ═══════════ */}
      <section className="py-12 md:py-16 border-t border-border">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-10 text-center md:px-16 md:py-14"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 mb-4">
              🏆 Réseau Expert Fluxteka
            </span>
            <h2 className="text-2xl font-heading font-bold text-white md:text-3xl">
              Vous êtes une agence ou un expert en automatisation ?
            </h2>
            <p className="mt-3 text-indigo-200 max-w-xl mx-auto">
              Rejoignez le réseau et recevez des missions qualifiées directement.
              Les 50 premiers experts bénéficient d&apos;un accès gratuit.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/agences"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
                id="home-agency-cta"
              >
                Rejoindre le réseau <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm text-indigo-200">50+ experts déjà actifs</span>
            </div>
          </motion.div>
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
              {tNews('badge')}
            </span>
            <h2 className="text-2xl font-heading font-bold text-text-primary">
              {tNews('title')}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {tNews('subtitle')}
            </p>

            <NewsletterForm />

            <p className="mt-3 text-xs text-text-secondary">
              {tNews('disclaimer')}
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
              {tCta('title')}
            </h2>
            <p className="mt-3 text-primary-200">
              {tCta('subtitle')}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/recherche"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 active:scale-[0.98]"
              >
              {tCta('searchWorkflow')}
              </Link>
              <Link
                href="/soumettre"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                {tCta('submitMine')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
