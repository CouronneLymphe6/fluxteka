'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, Loader2, Zap, Bell, Download, Palette, Check, X, Star, TrendingUp, Users, Lock } from 'lucide-react';

const FEATURES_COMPARISON = [
  { label: 'Recherche dans la bibliothèque', free: true, premium: true },
  { label: 'Filtres avancés', free: true, premium: true },
  { label: 'Sauvegardes illimitées', free: false, premium: true },
  { label: 'Workflows exclusifs experts', free: false, premium: true },
  { label: 'Alertes personnalisées par stack', free: false, premium: true },
  { label: 'Export JSON / Blueprint direct', free: false, premium: true },
  { label: 'Collections privées par client', free: false, premium: true },
  { label: 'Accès prioritaire aux nouveaux workflows', free: false, premium: true },
  { label: 'Support par email dédié', free: false, premium: true },
];

const TESTIMONIALS = [
  {
    name: 'Thomas R.',
    role: 'Growth Hacker, Berlin',
    avatar: 'T',
    text: 'J\'ai trouvé mon workflow Stripe → Slack en 30 secondes. Fluxteka m\'a économisé 2 jours de setup.',
    rating: 5,
  },
  {
    name: 'Sara M.',
    role: 'Consultante automation, Paris',
    avatar: 'S',
    text: 'Les alertes personnalisées sont exactement ce dont j\'avais besoin. Je reçois les nouveaux workflows N8N dès qu\'ils sont publiés.',
    rating: 5,
  },
  {
    name: 'David K.',
    role: 'CTO, Amsterdam',
    avatar: 'D',
    text: 'En tant que CTO, j\'apprécie que tous les workflows soient vérifiés. La qualité est au rendez-vous.',
    rating: 5,
  },
];

const WAITLIST_COUNT = 312;

export default function PremiumPage() {
  const [email, setEmail] = useState('');
  const [tool, setTool] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/smoke-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'premium_waitlist', email, tool }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError('Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#4338ca] py-20 text-white overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary-400/10 blur-3xl pointer-events-none" />

        <div className="container-page text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-yellow-300 mb-6">
              <Crown className="h-4 w-4" /> Fluxteka Premium
            </span>

            <h1 className="font-heading text-4xl font-bold md:text-6xl leading-tight">
              L&apos;automatisation<br />
              <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">sans limites</span>
            </h1>
            <p className="mt-5 text-blue-200 max-w-2xl mx-auto md:text-xl leading-relaxed">
              Workflows exclusifs d&apos;experts, alertes sur mesure et exports directs.
              Le plan pour les professionnels qui automatisent sérieusement.
            </p>

            {/* Social proof counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3"
            >
              <div className="flex -space-x-2">
                {['T', 'S', 'D', 'A'].map((l, i) => (
                  <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white">
                    {l}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{WAITLIST_COUNT} professionnels inscrits</p>
                <p className="text-xs text-blue-200">Gratuit pour les 50 premiers</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing table */}
      <section className="relative py-16 md:py-20">
        <div className="container-page max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary">Choisir son plan</h2>
            <p className="mt-3 text-text-secondary">Commence gratuitement. Passe à Premium quand tu es prêt.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">

            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-white p-8 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Gratuit</p>
                <p className="mt-2 text-4xl font-heading font-bold text-text-primary">0€<span className="text-lg font-normal text-text-secondary">/mois</span></p>
                <p className="mt-1 text-sm text-text-secondary">Pour découvrir et explorer</p>
              </div>
              <ul className="mt-8 space-y-3">
                {FEATURES_COMPARISON.map(f => (
                  <li key={f.label} className="flex items-center gap-3 text-sm">
                    {f.free
                      ? <Check className="h-4 w-4 text-success-500 shrink-0" />
                      : <X className="h-4 w-4 text-gray-300 shrink-0" />
                    }
                    <span className={f.free ? 'text-text-primary' : 'text-text-secondary'}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-8 w-full rounded-xl border border-border py-3 text-sm font-medium text-text-secondary cursor-default"
              >
                Plan actuel
              </button>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl border-2 border-accent-400 bg-gradient-to-b from-accent-50 to-white p-8 shadow-xl"
            >
              {/* Popular badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-500 to-amber-500 px-4 py-1 text-xs font-bold text-white shadow-sm">
                  <Crown className="h-3 w-3" /> Le plus populaire
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">Premium</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-heading font-bold text-text-primary">9€<span className="text-lg font-normal text-text-secondary">/mois</span></p>
                  <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs font-semibold text-success-700">Prix lancement</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">Facturation mensuelle · Résiliable à tout moment</p>
              </div>

              <ul className="mt-8 space-y-3">
                {FEATURES_COMPARISON.map(f => (
                  <li key={f.label} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-accent-500 shrink-0" />
                    <span className="text-text-primary font-medium">{f.label}</span>
                  </li>
                ))}
              </ul>

              {success ? (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="mt-8 flex flex-col items-center text-center gap-2 rounded-xl bg-success-50 border border-success-200 p-4">
                  <CheckCircle className="h-6 w-6 text-success-600" />
                  <p className="text-sm font-semibold text-success-700">Tu es inscrit !</p>
                  <p className="text-xs text-success-600">Tu seras parmi les premiers informés du lancement Premium.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Ton email *"
                    className="w-full rounded-xl border border-border py-3 px-4 text-sm focus:border-accent-400 focus:ring-2 focus:ring-accent-100 focus:outline-none"
                  />
                  <select
                    value={tool}
                    onChange={e => setTool(e.target.value)}
                    className="w-full rounded-xl border border-border py-3 px-4 text-sm bg-white focus:border-accent-400 focus:ring-2 focus:ring-accent-100 focus:outline-none"
                  >
                    <option value="">Outil principal (optionnel)</option>
                    <option value="n8n">N8N</option>
                    <option value="make">Make</option>
                    <option value="zapier">Zapier</option>
                    <option value="langchain">LangChain</option>
                    <option value="other">Autre</option>
                  </select>
                  {error && <p className="text-sm text-danger-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-amber-500 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-70 active:scale-[0.98] transition-all"
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Inscription...</>
                      : <><Crown className="h-4 w-4" /> Rejoindre la waitlist Premium</>
                    }
                  </button>
                  <p className="text-center text-xs text-text-secondary">Gratuit · Pas de carte bancaire · Désinscription en 1 clic</p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="bg-white py-16 border-t border-border">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center mb-12">Ce que tu débloques avec Premium</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, color: 'bg-amber-100 text-amber-600', title: 'Workflows exclusifs', desc: 'Automatisations avancées créées par des experts certifiés. Introuvables ailleurs.' },
              { icon: Bell, color: 'bg-blue-100 text-blue-600', title: 'Alertes personnalisées', desc: 'Reçois une notification dès qu\'un workflow correspond à ton stack technique.' },
              { icon: Download, color: 'bg-green-100 text-green-600', title: 'Export direct', desc: 'Exporte les fichiers JSON et blueprints en 1 clic. Import immédiat dans ton outil.' },
              { icon: Palette, color: 'bg-purple-100 text-purple-600', title: 'Collections privées', desc: 'Organise tes workflows par client ou projet. Retrouve-les instantanément.' },
            ].map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${f.color} mb-4`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 border-t border-border">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center mb-2">Ce qu&apos;ils en disent</h2>
          <p className="text-center text-sm text-text-secondary mb-10">Avis de nos early adopters</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">&quot;{t.text}&quot;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-secondary">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-[#312e81] to-[#4338ca] py-16 text-white text-center">
        <div className="container-page max-w-2xl">
          <Crown className="mx-auto h-10 w-10 text-amber-400 mb-4" />
          <h2 className="font-heading text-2xl font-bold md:text-3xl">{WAITLIST_COUNT} pros ont déjà rejoint la liste</h2>
          <p className="mt-3 text-blue-200">Sois parmi les 50 premiers → accès Premium gratuit au lancement.</p>
          <a href="#premium-waitlist" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3.5 text-sm font-bold text-gray-900 shadow-lg hover:opacity-90 transition-all">
            <Crown className="h-4 w-4" /> Rejoindre la waitlist Premium
          </a>
        </div>
      </section>
    </div>
  );
}
