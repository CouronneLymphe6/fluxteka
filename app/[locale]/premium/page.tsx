'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, Loader2, Zap, Bell, Download, Palette } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Workflows exclusifs', desc: 'Accès à des automatisations avancées créées par des experts, non disponibles en version gratuite.' },
  { icon: Bell, title: 'Alertes personnalisées', desc: 'Reçois une notification dès qu\'un workflow correspond à ton stack technique.' },
  { icon: Download, title: 'Téléchargement direct', desc: 'Exporte les fichiers JSON et blueprints en un clic, prêts à importer dans ton outil.' },
  { icon: Palette, title: 'Collections privées', desc: 'Organise tes workflows favoris en collections personnalisées pour chaque client ou projet.' },
];

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
      <section className="bg-gradient-to-b from-accent-900 via-accent-800 to-accent-700 py-16 text-white">
        <div className="container-page text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-accent-200 mb-6">
              <Crown className="h-4 w-4" /> Fluxteka Premium
            </span>
            <h1 className="font-heading text-3xl font-bold md:text-5xl">
              L&apos;automatisation sans limites
            </h1>
            <p className="mt-4 text-accent-200 max-w-2xl mx-auto md:text-lg">
              Workflows exclusifs, alertes personnalisées et téléchargement direct. Le plan pour les professionnels exigeants.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm">
              💎 Prix de lancement à venir · Gratuit pour les premiers inscrits
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gradient transition */}
      <div className="h-2 bg-gradient-to-b from-accent-700 to-transparent" />

      {/* Features */}
      <section className="py-14">
        <div className="container-page">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center">Ce que tu débloques</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100">
                  <f.icon className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="mt-4 font-heading font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-accent-400 to-transparent" />
      </div>

      {/* Waitlist */}
      <section className="bg-white py-14">
        <div className="container-page max-w-md">
          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-100">
                <CheckCircle className="h-7 w-7 text-success-600" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-text-primary">Tu es inscrit !</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Tu recevras un email dès que Premium sera disponible. Les premiers inscrits auront un accès gratuit.
              </p>
            </motion.div>
          ) : (
            <>
              <h2 className="font-heading text-xl font-bold text-text-primary text-center">
                Sois le premier informé
              </h2>
              <p className="mt-2 text-center text-sm text-text-secondary">
                Inscris-toi pour un accès prioritaire et gratuit au lancement.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="Ton email *"
                  className="w-full rounded-xl border border-border py-2.5 px-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                <select value={tool} onChange={e => setTool(e.target.value)}
                  className="w-full rounded-xl border border-border py-2.5 px-4 text-sm bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none">
                  <option value="">Outil principal (optionnel)</option>
                  <option value="n8n">N8N</option>
                  <option value="make">Make</option>
                  <option value="zapier">Zapier</option>
                  <option value="langchain">LangChain</option>
                  <option value="other">Autre</option>
                </select>
                {error && <p className="text-sm text-danger-600">{error}</p>}
                <button type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-accent-700 disabled:opacity-70 active:scale-[0.98]">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Inscription...</> : <><Crown className="h-4 w-4" /> Rejoindre la waitlist Premium</>}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
