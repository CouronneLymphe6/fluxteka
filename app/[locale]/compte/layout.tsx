'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Bookmark, Shield, Database, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/compte', label: 'Mon profil', icon: User, id: 'nav-profil' },
  { href: '/compte/sauvegardes', label: 'Mes sauvegardes', icon: Bookmark, id: 'nav-saves' },
  { href: '/compte/donnees', label: 'Mes données', icon: Database, id: 'nav-data' },
];

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getUser().then(({ data }: any) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        });
      } else {
        // Not authenticated → redirect to login
        router.replace('/connexion?redirect=/compte');
      }
      setAuthChecked(true);
    });
  }, [router]);

  // Show nothing while checking auth (avoids flash of protected content)
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
      </div>
    );
  }

  // If not authenticated, render nothing while redirect happens
  if (!user) return null;


  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* ═══ SIDEBAR ═══ */}
          <aside className="space-y-2">
            {/* User card */}
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-text-primary truncate">{user?.name || '...'}</p>
                  <p className="text-xs text-text-secondary truncate">{user?.email || '...'}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} id={item.id}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-b border-border last:border-b-0 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-l-2 border-l-primary-600'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-primary-600'
                    }`}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <button onClick={handleLogout} disabled={loggingOut} id="logout-btn"
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium text-danger-600 shadow-sm transition-all hover:bg-danger-50 disabled:opacity-60">
              {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Se déconnecter
            </button>
          </aside>

          {/* ═══ CONTENT ═══ */}
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="min-w-0">
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
