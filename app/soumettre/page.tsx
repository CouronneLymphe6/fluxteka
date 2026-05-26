'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link2, CheckCircle, Loader2, Info } from 'lucide-react';
import { z } from 'zod';

const TOOLS = ['N8N', 'Make', 'Zapier', 'LangChain', 'Autre'];
const CATEGORIES = [
  { value: 'sales-prospection', label: 'Ventes & Prospection' },
  { value: 'marketing-content', label: 'Marketing & Contenu' },
  { value: 'ai-agents', label: 'Agents IA' },
  { value: 'operations', label: 'Opérations & Gestion' },
  { value: 'customer-success', label: 'Relation Client' },
  { value: 'data-analytics', label: 'Data & Analytics' },
  { value: 'communication', label: 'Communication' },
  { value: 'dev-tech', label: 'Dev & Tech' },
  { value: 'finance-admin', label: 'Finance & Admin' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'hr-recrutement', label: 'RH & Recrutement' },
];

const SubmitSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(30).max(2000),
  tool: z.string().min(1),
  category: z.string().min(1),
  source_url: z.string().url().optional().or(z.literal('')),
  author_name: z.string().min(2).max(60),
  author_email: z.string().email(),
});

export default function SoumettreWorkflowPage() {
  const [form, setForm] = useState({
    title: '', description: '', tool: '', category: '',
    source_url: '', author_name: '', author_email: '',
    tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = SubmitSchema.safeParse({
      ...form,
      source_url: form.source_url || undefined,
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result.error.issues ?? []).forEach((e: any) => { errs[String(e.path?.[0] ?? '_')] = String(e.message); });
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/workflows/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source_url: form.source_url || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la soumission');
      }

      setSuccess(true);
    } catch {
      setErrors({ _: 'Erreur serveur. Réessaie.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-text-primary">Merci pour ta contribution !</h1>
          <p className="mt-2 text-text-secondary">
            Ton workflow a été soumis. Notre équipe le vérifie sous 48h. Tu recevras une notification par email.
          </p>
          <button onClick={() => setSuccess(false)}
            className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
            Soumettre un autre workflow
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container-page max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-2xl mb-3">
              <Upload className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-text-primary">Soumettre un workflow</h1>
            <p className="mt-2 text-text-secondary">
              Partage ta recette d&apos;automatisation avec la communauté. Tous les workflows sont vérifiés avant publication.
            </p>
          </div>

          {/* Info banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-800">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Fluxteka indexe des workflows publics et communautaires. Si tu souhaites soumettre une URL GitHub ou Make, ajoute-la dans le champ source. Notre IA enrichira automatiquement la description.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-white p-8 shadow-sm">
            {/* Title */}
            <div>
              <label htmlFor="submit-title" className="block text-xs font-medium text-text-secondary mb-1.5">
                Titre du workflow *
              </label>
              <input id="submit-title" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="ex: Envoyer un email quand un paiement Stripe échoue"
                className={`w-full rounded-xl border py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${errors.title ? 'border-danger-400' : 'border-border focus:border-primary-400'}`} />
              {errors.title && <p className="mt-1 text-xs text-danger-600">{errors.title}</p>}
            </div>

            {/* Tool + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="submit-tool" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Outil principal *
                </label>
                <select id="submit-tool" value={form.tool} onChange={e => set('tool', e.target.value)}
                  className={`w-full rounded-xl border py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white ${errors.tool ? 'border-danger-400' : 'border-border focus:border-primary-400'}`}>
                  <option value="">Choisir...</option>
                  {TOOLS.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="submit-category" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Catégorie *
                </label>
                <select id="submit-category" value={form.category} onChange={e => set('category', e.target.value)}
                  className={`w-full rounded-xl border py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white ${errors.category ? 'border-danger-400' : 'border-border focus:border-primary-400'}`}>
                  <option value="">Choisir...</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="submit-description" className="block text-xs font-medium text-text-secondary mb-1.5">
                Description *
                <span className="ml-1 font-normal text-text-secondary/60">({form.description.length}/2000)</span>
              </label>
              <textarea id="submit-description" value={form.description} onChange={e => set('description', e.target.value)}
                rows={5} maxLength={2000}
                placeholder="Décris ce que fait ce workflow, quand l'utiliser, et ce qu'il automatise..."
                className={`w-full rounded-xl border py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none ${errors.description ? 'border-danger-400' : 'border-border focus:border-primary-400'}`} />
              {errors.description && <p className="mt-1 text-xs text-danger-600">{errors.description}</p>}
            </div>

            {/* Source URL */}
            <div>
              <label htmlFor="submit-url" className="block text-xs font-medium text-text-secondary mb-1.5">
                URL Source <span className="font-normal text-text-secondary/60">(optionnel — GitHub, Make, n8n Community...)</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input id="submit-url" type="url" value={form.source_url} onChange={e => set('source_url', e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="submit-tags" className="block text-xs font-medium text-text-secondary mb-1.5">
                Tags <span className="font-normal text-text-secondary/60">(séparés par des virgules)</span>
              </label>
              <input id="submit-tags" value={form.tags} onChange={e => set('tags', e.target.value)}
                placeholder="email, stripe, notification, webhook"
                className="w-full rounded-xl border border-border py-2.5 px-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
            </div>

            <hr className="border-border" />

            {/* Author info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="submit-name" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Ton nom / pseudo *
                </label>
                <input id="submit-name" value={form.author_name} onChange={e => set('author_name', e.target.value)}
                  placeholder="Jean-Pierre"
                  className={`w-full rounded-xl border py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${errors.author_name ? 'border-danger-400' : 'border-border focus:border-primary-400'}`} />
              </div>
              <div>
                <label htmlFor="submit-email" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Ton email *
                </label>
                <input id="submit-email" type="email" value={form.author_email} onChange={e => set('author_email', e.target.value)}
                  placeholder="toi@example.com"
                  className={`w-full rounded-xl border py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${errors.author_email ? 'border-danger-400' : 'border-border focus:border-primary-400'}`} />
              </div>
            </div>

            {errors._ && <p className="text-sm text-danger-600">{errors._}</p>}

            <button type="submit" disabled={loading} id="soumettre-submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-70 active:scale-[0.98]">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</> : <><Upload className="h-4 w-4" /> Soumettre le workflow</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
