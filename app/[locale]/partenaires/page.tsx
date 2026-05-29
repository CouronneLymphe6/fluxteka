'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BadgeCheck, TrendingUp, BarChart3, Users, Loader2, CheckCircle, 
  Star, ArrowRight, Briefcase, Code2, Zap, MessageSquare 
} from 'lucide-react';

const EXPERT_BENEFITS = [
  { icon: BadgeCheck, title: 'Badge Expert Certifié', desc: 'Distingue-toi avec un badge de confiance visible sur chaque workflow que tu publies. Les entreprises te trouvent en premier.' },
  { icon: TrendingUp, title: 'Mise en avant prioritaire', desc: 'Tes workflows apparaissent en tête des résultats de recherche et dans la section Tendances.' },
  { icon: BarChart3, title: 'Analytics détaillées', desc: 'Accède aux vues, clics, sauvegardes et conversions de chaque workflow en temps réel.' },
  { icon: MessageSquare, title: 'Mise en relation directe', desc: 'Les entreprises peuvent te contacter directement depuis tes workflows pour des missions personnalisées.' },
];

const CREATOR_TYPES = [
  {
    icon: Briefcase,
    title: 'Agences automation',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    iconColor: 'bg-blue-100 text-blue-600',
    desc: 'Tu gères des clients sur Make, N8N ou Zapier ? Publie tes meilleurs workflows, crédibilise ton expertise et génère des demandes entrantes.',
    items: ['Profil agence mis en avant', 'Badge "Agence Vérifiée"', 'Formulaire de contact intégré'],
  },
  {
    icon: Code2,
    title: 'Freelances & consultants',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    iconColor: 'bg-purple-100 text-purple-600',
    desc: 'Tu construis des automatisations pour des clients ? Fluxteka est ta vitrine. Publie, sois trouvé, reçois des demandes qualifiées.',
    items: ['Page profil publique', 'Portfolio de workflows', 'Leads entrants qualifiés'],
  },
  {
    icon: Zap,
    title: 'Créateurs de workflows',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    iconColor: 'bg-amber-100 text-amber-600',
    desc: 'Tu crées des automatisations innovantes ? Partage ton expertise, bâtis ta réputation et monétise ton savoir-faire.',
    items: ['Commission sur workflows vendus', 'Attribution publique', 'Communauté d\'experts'],
  },
];

const TESTIMONIALS = [
  { name: 'Mathieu D.', role: 'Agence Make, Lyon', text: 'J\'ai reçu 3 demandes de missions dans le mois qui a suivi ma publication sur Fluxteka.', rating: 5 },
  { name: 'Elena K.', role: 'Freelance N8N, Bordeaux', text: 'Mon workflow LinkedIn automation a généré plus de visibilité que mon site web.', rating: 5 },
];

export default function PartenairesPage() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [expertType, setExpertType] = useState('');
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
        body: JSON.stringify({ type: 'agency_badge', email, company, website, message: expertType }),
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
      <section className="relative bg-gradient-to-b from-[#1e3a5f] to-[#1e40af] py-20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
        <div className="container-page text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-200 mb-6">
              <Users className="h-4 w-4" /> Programme Experts & Créateurs
            </span>
            <h1 className="font-heading text-4xl font-bold md:text-6xl leading-tight">
              Rejoins les experts<br />
              <span className="text-blue-300">qui font confiance à Fluxteka</span>
            </h1>
            <p className="mt-5 text-blue-200 max-w-2xl mx-auto md:text-xl leading-relaxed">
              Tu es agence, freelance ou créateur spécialisé en automatisation ?
              Publie tes workflows, gagne en visibilité et reçois des demandes qualifiées.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="#rejoindre"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-900 shadow-lg hover:bg-blue-50 transition-all">
                Rejoindre le programme <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#avantages"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20 transition-all">
                Voir les avantages
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Types d'experts */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary">Pour qui est ce programme ?</h2>
            <p className="mt-3 text-text-secondary">Que tu sois agence, freelance ou créateur, Fluxteka t&apos;ouvre une vitrine professionnelle</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {CREATOR_TYPES.map((type, i) => (
              <motion.div key={type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border-2 bg-white p-6 shadow-sm hover:shadow-md transition-all ${type.color}`}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${type.iconColor}`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-text-primary mb-2">{type.title}</h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">{type.desc}</p>
                <ul className="space-y-2">
                  {type.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-text-primary">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section id="avantages" className="py-16 bg-white border-t border-border">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl font-bold text-text-primary">Avantages du badge Expert</h2>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
              ⭐ 19€/mois · Lancement Q3 2026
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERT_BENEFITS.map((b, i) => (
              <motion.div key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-gray-50 p-6 text-center hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 mb-4">
                  <b.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-heading font-semibold text-text-primary">{b.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 border-t border-border">
        <div className="container-page max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-text-primary text-center mb-10">Ils ont rejoint le programme</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-text-secondary italic leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-secondary">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist form */}
      <section id="rejoindre" className="bg-white py-16 border-t border-border">
        <div className="container-page max-w-md">
          {success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 mb-4">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">Tu es sur la liste !</h2>
              <p className="mt-2 text-text-secondary">
                Nous te contacterons dès que le programme experts sera disponible. En attendant, tu peux déjà soumettre tes workflows.
              </p>
              <a href="/soumettre"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700">
                Soumettre un workflow <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="font-heading text-2xl font-bold text-text-primary">Rejoindre la liste d&apos;attente</h2>
                <p className="mt-2 text-text-secondary">Sois parmi les premiers experts certifiés Fluxteka.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Type d&apos;expert *</label>
                  <select value={expertType} onChange={e => setExpertType(e.target.value)} required
                    className="w-full rounded-xl border border-border py-2.5 px-4 text-sm bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none">
                    <option value="">Choisir...</option>
                    <option value="agency">Agence automation</option>
                    <option value="freelance">Freelance / consultant</option>
                    <option value="creator">Créateur de workflows</option>
                  </select>
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="Email professionnel *"
                  className="w-full rounded-xl border border-border py-2.5 px-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Nom de l'agence ou pseudo"
                  className="w-full rounded-xl border border-border py-2.5 px-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="Site web ou profil LinkedIn (optionnel)"
                  className="w-full rounded-xl border border-border py-2.5 px-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                {error && <p className="text-sm text-danger-600">{error}</p>}
                <button type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-70 active:scale-[0.98]">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Inscription...</> : 'Rejoindre le programme →'}
                </button>
                <p className="text-center text-xs text-text-secondary">Gratuit · Aucun engagement · Tu seras contacté personnellement</p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
