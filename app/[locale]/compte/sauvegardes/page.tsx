'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ExternalLink, Trash2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SavedItem {
  id: string;
  created_at: string;
  workflow: {
    id: string;
    slug: string;
    title: string;
    tool: string;
    category: string;
    score_total: number;
  };
}

export default function MesSauvegardesPage() {
  const [saves, setSaves] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/saves')
      .then(res => res.ok ? res.json() : { saves: [] })
      .then(data => setSaves(data.saves || []))
      .catch(() => setSaves([]))
      .finally(() => setLoading(false));
  }, []);

  const toolColors: Record<string, string> = {
    n8n: 'bg-orange-100 text-orange-700',
    make: 'bg-purple-100 text-purple-700',
    zapier: 'bg-orange-50 text-orange-600',
    langchain: 'bg-emerald-100 text-emerald-700',
    crewai: 'bg-blue-100 text-blue-700',
    autogen: 'bg-sky-100 text-sky-700',
    flowise: 'bg-cyan-100 text-cyan-700',
    dify: 'bg-violet-100 text-violet-700',
    activepieces: 'bg-rose-100 text-rose-700',
  };

  const handleRemove = async (id: string) => {
    const item = saves.find(s => s.id === id);
    if (!item) return;
    setSaves(s => s.filter(x => x.id !== id));
    try {
      await fetch('/api/user/saves', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_id: item.workflow.id }),
      });
    } catch { /* rollback could be added */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Mes sauvegardes</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Les workflows que tu as sauvegardés pour les retrouver facilement.
        </p>
      </div>

      {saves.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
          <Sparkles className="mx-auto h-10 w-10 text-primary-300" />
          <h2 className="mt-3 font-heading text-lg font-semibold text-text-primary">
            Aucune sauvegarde
          </h2>
          <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
            Clique sur le bouton &quot;Sauvegarder&quot; sur n&apos;importe quel workflow pour le retrouver ici.
          </p>
          <Link href="/recherche"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
            Découvrir des workflows
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {saves.map((item) => (
              <motion.div key={item.id} layout exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <Bookmark className="h-4 w-4 shrink-0 fill-primary-600 text-primary-600" />
                  <div className="min-w-0">
                    <Link href={`/workflow/${item.workflow.slug}`}
                      className="font-medium text-text-primary hover:text-primary-600 truncate block">
                      {item.workflow.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                        toolColors[item.workflow.tool] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.workflow.tool}
                      </span>
                      <span className="text-xs text-text-secondary">
                        ⭐ {item.workflow.score_total.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link href={`/workflow/${item.workflow.slug}`}
                    className="rounded-lg p-2 text-text-secondary hover:bg-gray-100 hover:text-primary-600">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button onClick={() => handleRemove(item.id)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-danger-50 hover:text-danger-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
