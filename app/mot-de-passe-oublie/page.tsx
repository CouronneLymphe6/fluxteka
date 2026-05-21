'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      });
      if (authError) throw authError;
      setSent(true);
    } catch {
      setError('Impossible d\'envoyer le lien. Vérifie ton email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]">

        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-heading font-bold text-primary-600">
          <span className="text-2xl">📚⚡</span> Fluxteka
        </Link>

        <div className="rounded-2xl border border-border bg-white/80 p-8 shadow-xl backdrop-blur-sm">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-100">
                <CheckCircle className="h-7 w-7 text-success-600" />
              </div>
              <h1 className="mt-4 font-heading text-xl font-bold text-text-primary">Email envoyé</h1>
              <p className="mt-2 text-sm text-text-secondary">
                Un lien de réinitialisation a été envoyé à <span className="font-medium text-text-primary">{email}</span>.
              </p>
              <div className="mt-5 rounded-xl bg-primary-50 p-3 text-xs text-primary-700">
                💡 Vérifie tes spams si tu ne reçois rien dans les 2 minutes.
              </div>
              <Link href="/connexion" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold text-text-primary text-center">
                Mot de passe oublié
              </h1>
              <p className="mt-2 text-center text-sm text-text-secondary">
                Entre ton email, on t&apos;envoie un lien magique.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-danger-50 px-3 py-2.5 text-sm text-danger-700">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="toi@example.com"
                    className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                    id="reset-email" />
                </div>
                <button type="submit" disabled={loading || !email.trim()} id="reset-submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-60 active:scale-[0.98]">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</> : <><Sparkles className="h-4 w-4" /> Envoyer le lien</>}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/connexion" className="text-xs text-text-secondary hover:text-primary-600 hover:underline">
                  ← Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
