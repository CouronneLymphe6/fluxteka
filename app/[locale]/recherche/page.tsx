'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Sparkles, Target, Megaphone, Bot, Settings, Users, BarChart, MessageSquare, Wrench, Coins, ShoppingCart, Briefcase } from 'lucide-react';
import WorkflowCard, { type WorkflowData } from '@/components/workflows/WorkflowCard';
import FilterBar from '@/components/workflows/FilterBar';
import { SkeletonGrid } from '@/components/shared/SkeletonCard';
import EmptyState from '@/components/shared/EmptyState';
import { useTranslations } from 'next-intl';

function RechercheContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tCat = useTranslations('categories');
  const t = useTranslations('search');

  const CATEGORIES = [
    { value: '', label: tCat('all'), icon: null },
    { value: 'sales-prospection', label: tCat('salesProspection'), icon: <Target className="h-3.5 w-3.5" /> },
    { value: 'marketing-content', label: tCat('marketingContent'), icon: <Megaphone className="h-3.5 w-3.5" /> },
    { value: 'ai-agents', label: tCat('aiAgents'), icon: <Bot className="h-3.5 w-3.5" /> },
    { value: 'operations', label: tCat('operations'), icon: <Settings className="h-3.5 w-3.5" /> },
    { value: 'customer-success', label: tCat('customerSuccess'), icon: <Users className="h-3.5 w-3.5" /> },
    { value: 'data-analytics', label: tCat('dataAnalytics'), icon: <BarChart className="h-3.5 w-3.5" /> },
    { value: 'communication', label: tCat('communication'), icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { value: 'dev-tech', label: tCat('devTech'), icon: <Wrench className="h-3.5 w-3.5" /> },
    { value: 'finance-admin', label: tCat('financeAdmin'), icon: <Coins className="h-3.5 w-3.5" /> },
    { value: 'ecommerce', label: tCat('ecommerce'), icon: <ShoppingCart className="h-3.5 w-3.5" /> },
    { value: 'hr-recrutement', label: tCat('hrRecruitment'), icon: <Briefcase className="h-3.5 w-3.5" /> },
  ];

  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tool, setTool] = useState(searchParams.get('tool') || '');
  const [sort, setSort] = useState(searchParams.get('tri') || 'score');
  const [category, setCategory] = useState(searchParams.get('categorie') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);

  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Sync URL params → state
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setInputValue(searchParams.get('q') || '');
    setTool(searchParams.get('tool') || '');
    setSort(searchParams.get('tri') || 'score');
    setCategory(searchParams.get('categorie') || '');
    setPage(parseInt(searchParams.get('page') || '1'));
  }, [searchParams]);

  // Fetch
  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (tool) params.set('tool', tool);
      if (sort) params.set('tri', sort);
      if (category) params.set('categorie', category);
      params.set('page', String(page));
      const res = await fetch(`/api/workflows?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWorkflows(data.workflows || []);
      setTotal(data.total || 0);
      setPages(data.pages || 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query, tool, sort, category, page]);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  const pushParams = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    p.delete('page');
    router.push(`/recherche?${p}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); pushParams({ q: inputValue }); };
  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/recherche?${params}`, { scroll: true });
  };

  const hasFilters = !!(tool || category || sort !== 'score');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky search + filters bar */}
      <div className="sticky top-16 z-30 border-b border-border bg-white shadow-sm">
        <div className="container-page py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder={t('placeholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                id="recherche-input"
              />
              {inputValue && (
                <button type="button" onClick={() => { setInputValue(''); pushParams({ q: '' }); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button type="submit" id="recherche-submit"
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 active:scale-[0.98]">
              {t('submit')}
            </button>
            <button type="button" onClick={() => setShowFilters(!showFilters)} id="filter-toggle"
              className={`relative rounded-xl border px-3 py-2.5 text-sm transition-all ${
                showFilters || hasFilters ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-border text-text-secondary hover:border-primary-300'
              }`}>
              <SlidersHorizontal className="h-4 w-4" />
              {hasFilters && <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-600 text-[9px] text-white font-bold">
                {[tool, category, sort !== 'score'].filter(Boolean).length}
              </span>}
            </button>
          </form>

          {/* Category filter drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                <div className="mt-3 pb-1">
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.value} onClick={() => pushParams({ categorie: cat.value })}
                        id={`filter-cat-${cat.value || 'all'}`}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          category === cat.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-text-secondary hover:bg-primary-50 hover:text-primary-600'
                        }`}>
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                  {hasFilters && (
                    <button onClick={() => pushParams({ tool: '', categorie: '', tri: 'score' })}
                      className="mt-2 text-xs text-danger-600 hover:underline">
                      {t('resetFilters')}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tool + sort bar */}
          <div className="mt-2">
            <FilterBar selectedTool={tool} selectedSort={sort}
              onToolChange={(t) => pushParams({ tool: t })}
              onSortChange={(s) => pushParams({ tri: s })} />
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container-page py-6">
        {/* Count + active pills */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {!loading && !error && (
            <p className="text-sm text-text-secondary">
              {total > 0 ? (
                <><span className="font-semibold text-text-primary">{total.toLocaleString('fr-FR')}</span> {total > 1 ? t('resultCountPlural', { count: '' }) : t('resultCount', { count: '' })}
                  {query && <> {t('forQuery', { query })}</>}
                </>
              ) : t('noResults')}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {query && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                &quot;{query}&quot; <button onClick={() => pushParams({ q: '' })}><X className="h-3 w-3" /></button>
              </span>
            )}
            {tool && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {tool} <button onClick={() => pushParams({ tool: '' })}><X className="h-3 w-3" /></button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {CATEGORIES.find(c => c.value === category)?.icon} {CATEGORIES.find(c => c.value === category)?.label}
                <button onClick={() => pushParams({ categorie: '' })}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid count={12} />
        ) : error ? (
          <EmptyState variant="error" onRetry={fetchWorkflows} />
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Sparkles className="h-12 w-12 text-primary-300 mb-3" />
            <h2 className="font-heading text-lg font-semibold text-text-primary">{t('noWorkflowFound')}</h2>
            <p className="mt-1 text-sm text-text-secondary max-w-sm">
              {query ? t('tryOtherTerm') : t('pipelineMessage')}
            </p>
            {hasFilters && (
              <button onClick={() => pushParams({ tool: '', categorie: '', tri: 'score', q: '' })}
                className="mt-4 text-sm font-medium text-primary-600 hover:underline">
                {t('viewAllWorkflows')}
              </button>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workflows.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}>
                <WorkflowCard workflow={w} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-1">
            <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} id="pagination-prev"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:border-primary-300 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" /> {t('previous')}
            </button>
            {Array.from({ length: Math.min(7, pages) }, (_, i) => {
              const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i;
              return (
                <button key={p} onClick={() => handlePageChange(p)} id={`pagination-${p}`}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                    p === page ? 'bg-primary-600 text-white' : 'border border-border text-text-secondary hover:border-primary-300 hover:text-primary-600'
                  }`}>{p}</button>
              );
            })}
            <button onClick={() => handlePageChange(page + 1)} disabled={page >= pages} id="pagination-next"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:border-primary-300 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed">
              {t('next')} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RechercheContent />
    </Suspense>
  );
}
