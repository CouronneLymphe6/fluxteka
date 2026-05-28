'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Loader2, BadgeCheck, Users, TrendingUp, Shield } from 'lucide-react';

const BENEFITS = [
  { icon: BadgeCheck, title: 'Badge Agence Vérifiée', desc: 'Distingue-toi des amateurs avec un badge de confiance sur chaque workflow que tu publies.' },
  { icon: Users, title: 'Visibilité prioritaire', desc: 'Tes workflows apparaissent en premier dans les résultats de recherche.' },
  { icon: TrendingUp, title: 'Statistiques avancées', desc: 'Accède aux analytics détaillées de tes workflows, incluant vues, clics et conversions.' },
  { icon: Shield, title: 'Support dédié', desc: 'Canal Slack privé avec l\'équipe Fluxteka pour tes questions et remontées.' },
];

export default function PartenairesPage() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
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
        body: JSON.stringify({ type: 'agency_badge', email, company, website }),
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
      <section className="bg-gradient-to-b from-primary-900 to-primary-700 py-16 text-white">
        <div className="container-page text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-primary-200 mb-6">
              <Building2 className="h-4 w-4" /> Programme Partenaires
            </span>
            <h1 className="font-heading text-3xl font-bold md:text-5xl">
              Deviens un partenaire certifié Fluxteka
            </h1>
            <p className="mt-4 text-primary-200 max-w-2xl mx-auto md:text-lg">
              Tu es une agence ou un freelance spécialisé en automatisation ? Obtiens le badge &quot;Agence Vérifiée&quot; et gagne en visibilité.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-accent-300 backdrop-blur-sm">
              ⭐ 19€/mois · Lancement prévu Q3 2026
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gradient transition */}
      <div className="h-2 bg-gradient-to-b from-primary-700 to-transparent" />

      {/* Benefits */}
      <section className="py-14">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center">Avantages du badge</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <b.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 font-heading font-semibold text-text-primary">{b.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
      </div>

      {/* Waitlist form */}
      <section className="bg-white py-14">
        <div className="container-page max-w-md">
          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-100">
                <CheckCircle className="h-7 w-7 text-success-600" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-text-primary">Tu es sur la liste !</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Nous te contacterons dès que le programme partenaires sera disponible.
              </p>
            </motion.div>
          ) : (
            <>
              <h2 className="font-heading text-xl font-bold text-text-primary text-center">
                Rejoins la liste d&apos;attente
              </h2>
              <p className="mt-2 text-center text-sm text-text-secondary">
                Sois parmi les premiers à obtenir le badge.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="Email professionnel *"
                  className="w-full rounded-xl border border-border py-2.5 px-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Nom de l'agence (optionnel)"
                  className="w-full rounded-xl border border-border py-2.5 px-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="Site web (optionnel)"
                  className="w-full rounded-xl border border-border py-2.5 px-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                {error && <p className="text-sm text-danger-600">{error}</p>}
                <button type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-70 active:scale-[0.98]">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Inscription...</> : 'Rejoindre la waitlist'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
