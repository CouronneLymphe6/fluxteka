'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, Loader2, Users, ArrowRight } from 'lucide-react';

const BUDGET_OPTIONS = [
  'Moins de 500€',
  '500€ – 1 500€',
  '1 500€ – 5 000€',
  'Plus de 5 000€',
  'À définir',
];

const QUICK_NEEDS = [
  { emoji: '📧', text: 'Automatiser mes emails' },
  { emoji: '🔗', text: 'Connecter mes outils (CRM, Notion…)' },
  { emoji: '🤖', text: 'Créer un agent IA' },
  { emoji: '📊', text: 'Automatiser mes rapports' },
  { emoji: '🛒', text: 'Automatiser mon e-commerce' },
  { emoji: '💰', text: 'Connecter Stripe à mon CRM' },
];

interface FindExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FindExpertModal({ isOpen, onClose }: FindExpertModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [need, setNeed] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!need.trim() || !email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ need: need.trim(), email: email.trim(), budget }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }

      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setNeed('');
    setEmail('');
    setBudget('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Trouver un expert</p>
                    <p className="text-xs text-gray-500">Réponse sous 48h ouvrées</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  id="find-expert-close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <AnimatePresence mode="wait">
                  {step === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-6 text-center"
                    >
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Demande reçue !</h3>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        Notre équipe va analyser ton besoin et te mettre en contact
                        avec les experts les plus adaptés sous <strong>48h ouvrées</strong>.
                      </p>
                      <p className="mt-3 text-xs text-gray-400">
                        Un email de confirmation va arriver dans ta boîte.
                      </p>
                      <button
                        onClick={handleReset}
                        className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                      >
                        Fermer
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {/* Quick needs */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Ton besoin <span className="text-red-500">*</span>
                        </label>
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {QUICK_NEEDS.map((q) => (
                            <button
                              key={q.text}
                              type="button"
                              onClick={() => setNeed(q.text)}
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                                need === q.text
                                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
                              }`}
                            >
                              <span>{q.emoji}</span> {q.text}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={need}
                          onChange={(e) => setNeed(e.target.value)}
                          placeholder="Décris ton projet d'automatisation en quelques mots..."
                          rows={3}
                          required
                          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          id="lead-need"
                          maxLength={500}
                        />
                        <p className="mt-1 text-right text-xs text-gray-400">{need.length}/500</p>
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="lead-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                          Ton email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="lead-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="toi@exemple.com"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      {/* Budget */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Budget approximatif <span className="text-gray-400">(optionnel)</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {BUDGET_OPTIONS.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setBudget(budget === b ? '' : b)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                                budget === b
                                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Error */}
                      {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                          {error}
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading || !need.trim() || !email.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        id="lead-submit"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Envoi en cours…
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Trouver mon expert
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-gray-400">
                        🔒 Gratuit et sans engagement — Notre équipe te répond sous 48h
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Inline button to trigger the modal ─────────────────────────────────────────
interface FindExpertButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function FindExpertButton({
  variant = 'primary',
  size = 'md',
  className = '',
  label = 'Trouver un expert',
}: FindExpertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantClasses = {
    primary: 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700',
    secondary: 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50',
    ghost: 'text-indigo-600 hover:bg-indigo-50',
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        id="find-expert-btn"
      >
        <Users className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
        {label}
        <ArrowRight className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      </button>
      <FindExpertModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

// Default export for lazy loading
export default FindExpertButton;
