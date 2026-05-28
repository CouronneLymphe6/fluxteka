'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function AuthPageContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<'google' | 'github' | 'magic' | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  // After login, redirect to the intended page (e.g. /compte)
  const redirectTo = searchParams.get('redirect') || '/';

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(provider);
    setError('');
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (authError) throw authError;
    } catch {
      setError(`Erreur de connexion avec ${provider === 'google' ? 'Google' : 'GitHub'}. Réessaie.`);
      setLoading(null);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading('magic');
    setError('');
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (authError) throw authError;
      setMagicSent(true);
    } catch {
      setError('Impossible d\'envoyer le lien. Vérifie ton email.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 via-white to-white px-4 py-12">
      {/* Decorative blurs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-100/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent-100/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-xl font-heading font-bold text-primary-600"
        >
          <span className="text-2xl">📚⚡</span>
          <span>Fluxteka</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-white/80 p-8 shadow-xl backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {magicSent ? (
              /* ═══ MAGIC LINK SENT STATE ═══ */
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-100">
                  <CheckCircle className="h-7 w-7 text-success-600" />
                </div>
                <h1 className="mt-4 font-heading text-xl font-bold text-text-primary">
                  Vérifie ta boîte mail
                </h1>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Un lien magique a été envoyé à{' '}
                  <span className="font-medium text-text-primary">{email}</span>.
                  <br />
                  Clique dessus pour te connecter.
                </p>
                <div className="mt-6 rounded-xl bg-primary-50 p-3 text-xs text-primary-700">
                  💡 Pense à vérifier tes spams si tu ne reçois rien dans les 2 minutes.
                </div>
                <button
                  onClick={() => { setMagicSent(false); setEmail(''); }}
                  className="mt-4 text-sm text-text-secondary hover:text-primary-600 hover:underline"
                >
                  Utiliser une autre adresse
                </button>
              </motion.div>
            ) : (
              /* ═══ AUTH FORM ═══ */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="text-center">
                  <h1 className="font-heading text-2xl font-bold text-text-primary">
                    Bienvenue sur Fluxteka
                  </h1>
                  <p className="mt-1.5 text-sm text-text-secondary">
                    Connecte-toi ou crée un compte en un clic.
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 rounded-xl bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── OAuth Buttons ── */}
                <div className="mt-6 space-y-2.5">
                  {/* Google */}
                  <button
                    onClick={() => handleOAuth('google')}
                    disabled={loading !== null}
                    className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    id="auth-google"
                  >
                    {loading === 'google' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-text-secondary" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Continuer avec Google
                  </button>

                  {/* GitHub */}
                  <button
                    onClick={() => handleOAuth('github')}
                    disabled={loading !== null}
                    className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    id="auth-github"
                  >
                    {loading === 'github' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    )}
                    Continuer avec GitHub
                  </button>
                </div>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-text-secondary">ou</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* ── Magic Link ── */}
                <form onSubmit={handleMagicLink} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="toi@example.com"
                      className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                      id="auth-email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading !== null || !email.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    id="auth-magic-link"
                  >
                    {loading === 'magic' ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Envoi du lien...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Recevoir un lien magique</>
                    )}
                  </button>
                </form>

                <p className="mt-5 text-center text-[11px] text-text-secondary leading-relaxed">
                  En continuant, tu acceptes nos{' '}
                  <Link href="/legal/cgu" className="text-primary-600 hover:underline">CGU</Link>
                  {' '}et notre{' '}
                  <Link href="/legal/confidentialite" className="text-primary-600 hover:underline">politique de confidentialité</Link>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-text-secondary">
          <span>🔒</span>
          <span>Aucun mot de passe · Aucune carte bancaire · 100% gratuit</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
