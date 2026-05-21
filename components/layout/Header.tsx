'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X, Upload, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

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
        setUser(null);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85" id="header-logo">
          {/* Fluxteka Logo — Option B: Rounded Square + F */}
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Carré arrondi indigo */}
            <rect width="34" height="34" rx="8" fill="#4338CA"/>
            {/* F — barre verticale */}
            <rect x="9" y="8" width="4" height="18" rx="1.5" fill="white"/>
            {/* F — barre haute */}
            <rect x="9" y="8" width="14" height="4" rx="1.5" fill="white"/>
            {/* F — barre milieu */}
            <rect x="9" y="15" width="11" height="3.5" rx="1.5" fill="white"/>
            {/* Détail flux — coupe diagonale en bas du F */}
            <polygon points="9,26 13,26 9,22" fill="#4338CA"/>
          </svg>
          <span className="text-xl font-heading font-bold tracking-tight">
            <span className="text-[#4338CA]">Flux</span><span className="text-[#374151] font-normal">teka</span>
          </span>
        </Link>

        {/* Search Bar — hidden on home page */}
        {!isHome && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input ref={searchRef} type="text" placeholder="Rechercher un workflow..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                id="header-search-input" />
            </form>
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/carte"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-50 hover:text-primary-600 ${
              pathname === '/carte' ? 'bg-primary-50 text-primary-600' : 'text-text-secondary'
            }`} id="nav-carte">
            🗺️ Carte
          </Link>

          <Link href="/soumettre"
            className="rounded-lg border border-primary-200 px-4 py-2 text-sm font-medium text-primary-600 transition-all hover:bg-primary-50 hover:border-primary-400"
            id="nav-submit">
            <Upload className="inline-block mr-1.5 h-4 w-4" />
            Soumettre
          </Link>

          {user ? (
            /* ── Logged in: user dropdown ── */
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100"
                id="nav-user-menu">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-border bg-white py-1.5 shadow-lg">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
                      <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
                    </div>
                    <Link href="/compte" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary-600" id="dropdown-profile">
                      <User className="h-3.5 w-3.5" /> Mon profil
                    </Link>
                    <Link href="/compte/sauvegardes" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary-600" id="dropdown-saves">
                      📑 Mes sauvegardes
                    </Link>
                    <Link href="/compte/donnees" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary-600" id="dropdown-data">
                      🔒 Mes données
                    </Link>
                    <hr className="my-1 border-border" />
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50" id="dropdown-logout">
                      <LogOut className="h-3.5 w-3.5" /> Se déconnecter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Not logged in ── */
            <Link href="/connexion"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-[0.98]"
              id="nav-login">
              Connexion
            </Link>
          )}
        </nav>

        {/* Mobile: Search + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {!isHome && (
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-lg p-2 text-text-secondary hover:bg-gray-100" aria-label="Rechercher" id="mobile-search-toggle">
              <Search className="h-5 w-5" />
            </button>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-text-secondary hover:bg-gray-100" aria-label="Menu" id="mobile-menu-toggle">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && !isHome && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-border overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="container-page py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input type="text" placeholder="Rechercher un workflow..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  autoFocus id="mobile-search-input" />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-border bg-white overflow-hidden">
            <div className="container-page flex flex-col gap-1 py-4">
              <Link href="/"
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${pathname === '/' ? 'bg-primary-50 text-primary-600' : 'text-text-secondary hover:bg-gray-50'}`}
                id="mobile-nav-home">
                🏠 Accueil
              </Link>
              <Link href="/carte"
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${pathname === '/carte' ? 'bg-primary-50 text-primary-600' : 'text-text-secondary hover:bg-gray-50'}`}
                id="mobile-nav-carte">
                🗺️ Carte de l&apos;automatisation
              </Link>
              <Link href="/recherche"
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${pathname === '/recherche' ? 'bg-primary-50 text-primary-600' : 'text-text-secondary hover:bg-gray-50'}`}
                id="mobile-nav-search">
                🔍 Recherche
              </Link>
              <hr className="my-2 border-border" />
              <Link href="/soumettre"
                className="rounded-lg px-4 py-3 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                id="mobile-nav-submit">
                📤 Soumettre un workflow
              </Link>

              {user ? (
                <>
                  <hr className="my-2 border-border" />
                  <Link href="/compte"
                    className="rounded-lg px-4 py-3 text-sm font-medium text-text-secondary hover:bg-gray-50" id="mobile-nav-compte">
                    👤 Mon compte
                  </Link>
                  <Link href="/compte/sauvegardes"
                    className="rounded-lg px-4 py-3 text-sm font-medium text-text-secondary hover:bg-gray-50" id="mobile-nav-saves">
                    📑 Mes sauvegardes
                  </Link>
                  <button onClick={handleLogout}
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-danger-600 hover:bg-danger-50" id="mobile-nav-logout">
                    🚪 Se déconnecter
                  </button>
                </>
              ) : (
                <Link href="/connexion"
                  className="rounded-lg bg-primary-600 mx-4 mt-2 px-4 py-3 text-center text-sm font-medium text-white transition-all hover:bg-primary-700"
                  id="mobile-nav-login">
                  Connexion
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
