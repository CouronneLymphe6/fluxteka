'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Star, Users, ArrowRight, Loader2 } from 'lucide-react';

const TECHNOLOGIES = ['N8N', 'Make (Integromat)', 'Zapier', 'LangChain', 'Python', 'API REST', 'Webhook', 'OpenAI', 'Airtable', 'Notion'];

const BENEFITS = [
  { icon: '📥', title: 'Leads qualifiés', desc: 'Recevez des demandes de missions d\'entreprises qui ont déjà identifié leur besoin d\'automatisation.' },
  { icon: '🏆', title: 'Badge Expert Vérifié', desc: 'Obtenez une visibilité premium avec notre badge de certification et apparaissez en premier dans les résultats.' },
  { icon: '📊', title: 'Dashboard analytique', desc: 'Suivez vos vues, clics et conversions en temps réel. Optimisez votre visibilité grâce aux données.' },
  { icon: '🤝', title: 'Communauté exclusive', desc: 'Rejoignez un réseau d\'experts en automatisation, partagez vos meilleures pratiques et opportunités.' },
];

const TESTIMONIALS = [
  { name: 'Thomas D.', role: 'Freelance N8N', quote: 'En 3 semaines sur Fluxteka, j\'ai reçu 4 demandes de missions. La qualité des leads est bien supérieure à ce que j\'avais sur Malt.', rating: 5 },
  { name: 'Agence Nexflow', role: 'Agence Automation', quote: 'Nous avons trouvé 2 clients réguliers via Fluxteka. Le fait que les prospects aient déjà choisi leur outil change tout.', rating: 5 },
];

export default function AgencyRegistrationForm() {
  const [form, setForm] = useState({ name: '', email: '', website: '', description: '' });
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const toggleTech = (tech: string) => {
    setTechnologies(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (technologies.length === 0) {
      setError('Sélectionne au moins une technologie.');
      return;
    }
    setError('');
    setStatus('loading');

    try {
      const res = await fetch('/api/agences/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, technologies }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
      setError('Une erreur est survenue. Réessaie ou contacte-nous directement.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Candidature envoyée ! 🎉</h3>
        <p className="mt-3 text-gray-600 max-w-md mx-auto">
          Notre équipe va examiner ton profil et te recontactera sous 48h ouvrées pour finaliser ton inscription.
        </p>
        <p className="mt-6 text-sm text-gray-500">En attendant, explore la plateforme pour t'en imprégner.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nom / Agence *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Jean Martin ou Nexflow Agency"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email professionnel *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="jean@agence.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Site web ou portfolio</label>
        <input
          type="url"
          value={form.website}
          onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
          placeholder="https://ton-site.com"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Technologies maîtrisées *</label>
        <div className="flex flex-wrap gap-2">
          {TECHNOLOGIES.map(tech => (
            <button
              key={tech}
              type="button"
              onClick={() => toggleTech(tech)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                technologies.includes(tech)
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {technologies.includes(tech) && <span className="mr-1">✓</span>}
              {tech}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Décris ton expertise et tes types de missions *
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Ex: Spécialisé en automatisation commerciale (CRM, prospection LinkedIn, notifications Slack). 3 ans d'expérience avec N8N. J'accompagne des PME de 10-100 personnes..."
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
          required
          minLength={100}
        />
        <p className="mt-1 text-xs text-gray-400">{form.description.length}/100 caractères minimum</p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        id="agency-submit-btn"
      >
        {status === 'loading' ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...</>
        ) : (
          <><ArrowRight className="h-4 w-4" /> Envoyer ma candidature</>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Ton profil sera examiné sous 48h. 100% gratuit pour les 50 premiers experts.
      </p>
    </form>
  );
}

export function AgencyBenefits() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {BENEFITS.map((b) => (
        <motion.div
          key={b.title}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="text-2xl mb-3">{b.icon}</div>
          <h3 className="font-semibold text-gray-900">{b.title}</h3>
          <p className="mt-1.5 text-sm text-gray-600">{b.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function AgencyTestimonials() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {TESTIMONIALS.map((t) => (
        <div key={t.name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-gray-700 italic">"{t.quote}"</p>
          <div className="mt-3">
            <p className="text-sm font-semibold text-gray-900">{t.name}</p>
            <p className="text-xs text-gray-500">{t.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
