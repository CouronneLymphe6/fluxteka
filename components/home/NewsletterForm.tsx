'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function NewsletterForm() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      if (res.ok || res.status === 409) {
        setNewsletterSent(true);
      } else {
        const data = await res.json();
        setError(data.error || t('errorRegister') || 'Erreur lors de l\'inscription');
      }
    } catch {
      setError(t('errorConnection') || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl text-center">
      <AnimatePresence mode="wait">
        {newsletterSent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
          >
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 font-medium text-emerald-800">{t('successTitle')}</p>
            <p className="mt-1 text-sm text-emerald-700">{t('successMessage')}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleNewsletter}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder={t('placeholder')}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none disabled:opacity-50"
                id="newsletter-email"
              />
              {error && <p className="text-red-500 text-xs mt-1 text-left pl-2">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-[0.98] whitespace-nowrap disabled:opacity-50"
            >
              {loading ? t('loading') : t('subscribe')}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
