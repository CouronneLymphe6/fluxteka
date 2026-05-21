'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, Bookmark, Flag, Star, Eye, Calendar,
  Tag, ArrowLeft, Share2, ChevronDown, ChevronUp,
  CheckCircle, Loader2, ThumbsUp, GitBranch, Globe,
  ArrowRight, Zap, AlertCircle, Clock, Code2, Briefcase, Users
} from 'lucide-react';
import ScoreBadge from '@/components/workflows/ScoreBadge';
import AffiliateButton from '@/components/workflows/AffiliateButton';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

/* ─── Tool colours ─── */
const toolColors: Record<string, string> = {
  n8n: 'bg-orange-100 text-orange-700 border-orange-200',
  make: 'bg-purple-100 text-purple-700 border-purple-200',
  zapier: 'bg-orange-50 text-orange-600 border-orange-100',
  langchain: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  crewai: 'bg-blue-100 text-blue-700 border-blue-200',
  autogen: 'bg-sky-100 text-sky-700 border-sky-200',
  flowise: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  activepieces: 'bg-rose-100 text-rose-700 border-rose-200',
};

const toolDots: Record<string, string> = {
  n8n: 'bg-orange-400',
  make: 'bg-purple-400',
  zapier: 'bg-orange-300',
  langchain: 'bg-emerald-400',
  crewai: 'bg-blue-400',
  autogen: 'bg-sky-400',
  flowise: 'bg-cyan-400',
  activepieces: 'bg-rose-400',
};

/* ─── Source platform badges ─── */
const sourcePlatforms: Record<string, { label: string; emoji: string; color: string }> = {
  'n8n-community':    { label: 'N8N Community', emoji: '🟠', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  'make-templates':   { label: 'Make Templates', emoji: '🟣', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'zapier-templates': { label: 'Zapier Templates', emoji: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'github':           { label: 'GitHub', emoji: '⚫', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  'reddit':           { label: 'Reddit', emoji: '🔴', color: 'bg-red-50 text-red-700 border-red-200' },
  'youtube':          { label: 'YouTube', emoji: '▶️', color: 'bg-red-50 text-red-700 border-red-200' },
};

/* ─── Types ─── */
interface SimilarWorkflow {
  id: string; slug: string; title: string; tool: string;
  category: string; score_total: number; views: number;
  description_fr: string;
  _count: { saved_by: number };
}

interface Review {
  id: string; rating: number; comment?: string; created_at: string;
  user: { id: string; name: string; avatar?: string };
}

interface WorkflowDetail {
  id: string; slug: string; title: string;
  description_fr: string; how_to_use?: string; prerequisites?: string;
  tool: string; tools_connected: string[]; category: string; tags: string[];
  source_url?: string; source_type?: string; source_stars: number;
  price: number; is_premium: boolean; status: string;
  score_total: number; score_users: number; score_popularity: number;
  score_freshness: number; score_reports: number;
  views: number; downloads: number; created_at: string;
  author: { id: string; name: string; avatar?: string; bio?: string; github_url?: string; website_url?: string; role?: string };
  reviews: Review[];
  _count: { reviews: number; saved_by: number };
  similar?: SimilarWorkflow[];
}

/* ─── Star display (read-only) ─── */
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${sz} ${s <= Math.round(rating) ? 'fill-accent-400 text-accent-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

/* ─── Pipeline visualisation ─── */
function WorkflowPipeline({ tool, tools_connected }: { tool: string; tools_connected: string[] }) {
  const all = [tool, ...tools_connected].filter(Boolean).slice(0, 6);
  if (all.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <h2 className="font-heading text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary-500" />
        Comment ça fonctionne
      </h2>
      <p className="text-xs text-text-secondary mb-5">Pipeline d&apos;automatisation — flux des données</p>

      {/* Pipeline nodes */}
      <div className="flex flex-wrap items-center gap-2">
        {all.map((t, i) => {
          const dot = toolDots[t.toLowerCase()] || 'bg-gray-400';
          const isFirst = i === 0;
          const isLast = i === all.length - 1;
          return (
            <div key={t} className="flex items-center gap-2">
              {/* Node */}
              <div className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 min-w-[80px] text-center transition-all
                ${isFirst ? 'border-primary-300 bg-primary-50' : isLast ? 'border-success-300 bg-success-50' : 'border-border bg-gray-50'}`}>
                {/* Step badge */}
                <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold
                  ${isFirst ? 'bg-primary-500 text-white' : isLast ? 'bg-success-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {isFirst ? 'Entrée' : isLast ? 'Sortie' : `Étape ${i}`}
                </span>
                {/* Dot + name */}
                <div className={`h-3 w-3 rounded-full ${dot} mt-1`} />
                <span className="text-xs font-semibold text-text-primary capitalize">{t}</span>
              </div>
              {/* Arrow */}
              {i < all.length - 1 && (
                <ArrowRight className="h-4 w-4 text-text-secondary shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-text-secondary border-t border-border pt-4">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary-400" /> Déclencheur / Source
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-400" /> Traitement
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success-400" /> Résultat final
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Interactive prerequisites checklist ─── */
function PrerequisiteChecklist({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  const [checked, setChecked] = useState<boolean[]>(lines.map(() => false));
  const done = checked.filter(Boolean).length;
  const pct = Math.round((done / lines.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-500" />
          Prérequis
        </h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pct === 100 ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-text-secondary'}`}>
          {done}/{lines.length} prêt{done > 1 ? 's' : ''}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-success-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <ul className="space-y-2.5">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-3 cursor-pointer group" onClick={() => {
            const next = [...checked];
            next[i] = !next[i];
            setChecked(next);
          }}>
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all
              ${checked[i] ? 'border-success-400 bg-success-400' : 'border-gray-300 group-hover:border-primary-400'}`}>
              {checked[i] && <CheckCircle className="h-3.5 w-3.5 text-white" />}
            </div>
            <span className={`text-sm leading-relaxed transition-colors ${checked[i] ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
              {line}
            </span>
          </li>
        ))}
      </ul>

      {pct === 100 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-xl bg-success-50 border border-success-200 p-3 text-sm text-success-700 font-medium">
          <CheckCircle className="h-4 w-4" /> Tu es prêt à déployer ce workflow ! 🚀
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Upvote + Quick stars ─── */
function QuickRating({ workflowId, initialCount }: { workflowId: string; initialCount: number }) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [starRating, setStarRating] = useState(0);
  const [starHover, setStarHover] = useState(0);
  const [starDone, setStarDone] = useState(false);
  const [starSubmitting, setStarSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpvote = async () => {
    if (upvoting) return;
    setUpvoting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_id: workflowId, rating: 5 }),
      });
      if (res.status === 401) {
        setMsg('Connecte-toi pour voter');
        setTimeout(() => setMsg(''), 3000);
      } else if (res.ok || res.status === 409) {
        if (!upvoted) { setUpvoted(true); setCount(c => c + 1); }
      }
    } catch { /* ignore */ }
    setUpvoting(false);
  };

  const handleStar = async (s: number) => {
    if (starSubmitting || starDone) return;
    setStarRating(s);
    setStarSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_id: workflowId, rating: s }),
      });
      if (res.status === 401) {
        setMsg('Connecte-toi pour noter');
        setTimeout(() => setMsg(''), 3000);
        setStarRating(0);
      } else if (res.ok || res.status === 409) {
        setStarDone(true);
      }
    } catch { /* ignore */ }
    setStarSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
        ⭐ Évaluer ce workflow
      </h2>

      {/* Upvote */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-gray-50 p-4 mb-4">
        <div>
          <p className="text-sm font-medium text-text-primary">Utile ?</p>
          <p className="text-xs text-text-secondary">{count} personne{count !== 1 ? 's' : ''} ont trouvé ça utile</p>
        </div>
        <button
          onClick={handleUpvote}
          disabled={upvoting || upvoted}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60
            ${upvoted ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-white border border-border hover:border-primary-300 hover:text-primary-600 text-text-secondary'}`}
        >
          {upvoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className={`h-4 w-4 ${upvoted ? 'fill-primary-600' : ''}`} />}
          {upvoted ? 'Voté !' : 'Oui'}
        </button>
      </div>

      {/* Star rating — quick, no textarea */}
      {!starDone ? (
        <div className="rounded-xl border border-border bg-gray-50 p-4">
          <p className="text-sm font-medium text-text-primary mb-2">Ta note</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button"
                onMouseEnter={() => setStarHover(s)}
                onMouseLeave={() => setStarHover(0)}
                onClick={() => handleStar(s)}
                disabled={starSubmitting}
                className="transition-transform hover:scale-110 disabled:opacity-50"
              >
                <Star className={`h-7 w-7 transition-colors ${s <= (starHover || starRating) ? 'fill-accent-400 text-accent-400' : 'text-gray-200'}`} />
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-text-secondary">
            {starHover === 1 ? '😕 Décevant' : starHover === 2 ? '😐 Passable' : starHover === 3 ? '🙂 Correct' : starHover === 4 ? '😊 Bien' : starHover === 5 ? '🤩 Excellent !' : 'Clique sur une étoile'}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-success-50 border border-success-200 p-3 text-sm text-success-700">
          <CheckCircle className="h-4 w-4" /> Merci pour ta note !
        </div>
      )}

      {/* Auth message */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {msg} — <Link href="/connexion" className="underline font-medium">Se connecter</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Similar workflows ─── */
function SimilarWorkflows({ workflows, currentTool }: { workflows: SimilarWorkflow[]; currentTool: string }) {
  if (!workflows?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <h2 className="font-heading text-lg font-bold text-text-primary mb-1">
        🔗 Tu pourrais aussi aimer
      </h2>
      <p className="text-xs text-text-secondary mb-4">Workflows similaires de la bibliothèque</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {workflows.map(wf => {
          const tc = toolColors[wf.tool.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
          return (
            <Link key={wf.id} href={`/workflow/${wf.slug}`}
              className="group rounded-xl border border-border p-4 hover:border-primary-300 hover:shadow-sm transition-all">
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${tc} mb-2`}>
                {wf.tool}
              </span>
              <p className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-primary-600 transition-colors">
                {wf.title}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {wf.views.toLocaleString('fr-FR')}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent-300 text-accent-300" /> {wf.score_total.toFixed(1)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function WorkflowDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [shareMsg, setShareMsg] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/workflows/${slug}`)
      .then(res => {
        if (res.status === 404) { setNotFoundState(true); return null; }
        return res.json();
      })
      .then(data => { if (data) setWorkflow(data); })
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMsg('Lien copié !');
      setTimeout(() => setShareMsg(''), 2000);
    } catch { setShareMsg(''); }
  };

  const handleSave = async () => {
    if (!workflow || saveLoading) return;
    setSaveLoading(true);
    setSaveMsg('');
    try {
      if (!saved) {
        const res = await fetch('/api/user/saves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflow_id: workflow.id }),
        });
        if (res.status === 401) {
          setSaveMsg('Connecte-toi pour sauvegarder');
          setTimeout(() => setSaveMsg(''), 3000);
        } else if (res.ok) {
          setSaved(true);
          setSaveMsg('Sauvegardé !');
          setTimeout(() => setSaveMsg(''), 2000);
        }
      } else {
        const res = await fetch('/api/user/saves', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflow_id: workflow.id }),
        });
        if (res.ok) {
          setSaved(false);
          setSaveMsg('Retiré');
          setTimeout(() => setSaveMsg(''), 2000);
        }
      }
    } catch {
      setSaveMsg('Erreur réseau');
      setTimeout(() => setSaveMsg(''), 2000);
    }
    setSaveLoading(false);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (notFoundState || !workflow) {
    notFound();
    return null;
  }

  const toolColor = toolColors[workflow.tool.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
  const source = sourcePlatforms[workflow.source_type?.toLowerCase() || ''];
  const desc = workflow.description_fr;
  const descTruncated = desc.length > 500 && !showFullDesc;
  const avgRating = workflow._count.reviews > 0
    ? workflow.reviews.reduce((s, r) => s + r.rating, 0) / workflow.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="border-b border-border bg-white">
        <div className="container-page py-3 flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary-600">Accueil</Link>
          <span>/</span>
          <Link href="/recherche" className="hover:text-primary-600">Workflows</Link>
          <span>/</span>
          <span className="text-text-primary font-medium line-clamp-1">{workflow.title}</span>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ═══════════════════════════
              MAIN CONTENT (2/3)
          ═══════════════════════════ */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Hero card ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm">

              {/* Tool badge + source platform + views */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${toolColor}`}>
                    {workflow.tool}
                  </span>
                  {source && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${source.color}`}>
                      {source.emoji} {source.label}
                    </span>
                  )}
                  {workflow.is_premium && (
                    <span className="inline-flex items-center rounded-full bg-accent-100 border border-accent-200 px-2.5 py-1 text-xs font-semibold text-accent-700">
                      ⭐ Premium
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Eye className="h-3.5 w-3.5" />
                  {workflow.views.toLocaleString('fr-FR')} vues
                </div>
              </div>

              {/* Title */}
              <h1 className="mt-4 font-heading text-2xl font-bold text-text-primary leading-snug md:text-3xl">
                {workflow.title}
              </h1>

              {/* Author + date + source */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {/* Author chip */}
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white shadow-sm">
                    {workflow.author.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-text-primary">{workflow.author.name}</span>
                  {workflow.author.role === 'seller' && (
                    <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-600">
                      ✓ Vérifié
                    </span>
                  )}
                </div>
                <span className="text-text-secondary">·</span>
                <div className="flex items-center gap-1 text-text-secondary">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(workflow.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {workflow.source_stars > 0 && (
                  <>
                    <span className="text-text-secondary">·</span>
                    <span className="flex items-center gap-1 text-text-secondary text-xs">
                      <Star className="h-3 w-3 fill-accent-300 text-accent-300" />
                      {workflow.source_stars.toLocaleString('fr-FR')} sur la plateforme
                    </span>
                  </>
                )}
              </div>

              {/* Score + rating */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <ScoreBadge
                  total={workflow.score_total} users={workflow.score_users}
                  popularity={workflow.score_popularity} freshness={workflow.score_freshness}
                  reports={workflow.score_reports}
                />
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarDisplay rating={avgRating} size="sm" />
                    <span className="text-xs text-text-secondary">
                      {avgRating.toFixed(1)} ({workflow._count.reviews} avis)
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-5">
                <p className={`text-sm text-text-secondary leading-relaxed ${descTruncated ? 'line-clamp-6' : ''}`}>
                  {desc}
                </p>
                {desc.length > 500 && (
                  <button onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                    {showFullDesc ? <><ChevronUp className="h-3.5 w-3.5" /> Voir moins</> : <><ChevronDown className="h-3.5 w-3.5" /> Voir plus</>}
                  </button>
                )}
              </div>

              {/* Tags */}
              {workflow.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                  <Tag className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                  {workflow.tags.map(tag => (
                    <Link key={tag} href={`/recherche?q=${encodeURIComponent(tag)}`}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-colors">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Tools connected */}
              {workflow.tools_connected.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-text-secondary mb-1.5">Outils connectés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {workflow.tools_connected.map(t => {
                      const tc = toolColors[t.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200';
                      return (
                        <span key={t} className={`rounded-md border px-2 py-0.5 text-xs font-medium ${tc}`}>{t}</span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* ── Pipeline visual ── */}
            <WorkflowPipeline tool={workflow.tool} tools_connected={workflow.tools_connected} />

            {/* ── Pour qui ? ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
              className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
              <div className="border-b border-border bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                <h2 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-500" />
                  Pour qui est ce workflow ?
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">Guide adapté à votre profil</p>
              </div>
              <div className="divide-y divide-border">

                {/* Persona 1 — Je veux automatiser sans coder */}
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition-colors list-none">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">🎯 Je veux automatiser sans coder</p>
                        <p className="text-xs text-text-secondary">Je cherche à gagner du temps sur une tâche répétitive</p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-text-secondary transition-transform group-open:rotate-180 shrink-0" />
                  </summary>
                  <div className="px-6 pb-5 pt-2 space-y-3">
                    <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3">
                      <Clock className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700">Ce que ça vous apporte</p>
                        <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">Automatisez une tâche répétitive sans écrire une ligne de code. Économisez des heures par semaine et concentrez-vous sur ce qui compte.</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-text-primary">Comment faire concrètement :</p>
                    <ol className="space-y-2">
                      {[
                        { step: '1', text: 'Créez un compte gratuit sur la plateforme indiquée (N8N, Make, Zapier...)' },
                        { step: '2', text: 'Cliquez sur "Voir la source" et importez le workflow en 1 clic' },
                        { step: '3', text: 'Connectez vos comptes (Gmail, Slack, etc.) via les boutons intégrés' },
                        { step: '4', text: 'Testez avec un cas réel — le résultat arrive en quelques secondes' },
                      ].map(({ step, text }) => (
                        <li key={step} className="flex items-start gap-2.5 text-xs text-text-secondary">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700">{step}</span>
                          {text}
                        </li>
                      ))}
                    </ol>
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
                      💡 <strong>Besoin d&apos;aide ?</strong> Nos partenaires intégrateurs peuvent déployer ce workflow pour vous. <Link href="/partenaires" className="underline">Voir les partenaires →</Link>
                    </div>
                  </div>
                </details>

                {/* Persona 2 — Je veux apprendre en faisant */}
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition-colors list-none">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                        <span className="text-base">⚡</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">⚡ Je veux apprendre en faisant</p>
                        <p className="text-xs text-text-secondary">Je découvre l&apos;automatisation et je veux un premier succès concret</p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-text-secondary transition-transform group-open:rotate-180 shrink-0" />
                  </summary>
                  <div className="px-6 pb-5 pt-2 space-y-3">
                    <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                      <span className="text-base shrink-0">🎯</span>
                      <div>
                        <p className="text-xs font-semibold text-emerald-700">Ce que tu vas apprendre</p>
                        <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">Comment connecter plusieurs outils entre eux, créer des automatisations réelles, et comprendre les concepts de base des workflows.</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-text-primary">Par où commencer :</p>
                    <ol className="space-y-2">
                      {[
                        { step: '1', text: 'Regarde le schéma "Comment ça fonctionne" ci-dessus pour comprendre le flux' },
                        { step: '2', text: 'Ouvre un compte gratuit sur la plateforme (lien dans la sidebar → Essayer les outils)' },
                        { step: '3', text: 'Suis le guide de déploiement étape par étape — chaque point est actionnable' },
                        { step: '4', text: 'Coche les prérequis au fur et à mesure pour ne rien oublier' },
                        { step: '5', text: 'Sauvegarde ce workflow pour y revenir facilement depuis ton espace' },
                      ].map(({ step, text }) => (
                        <li key={step} className="flex items-start gap-2.5 text-xs text-text-secondary">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">{step}</span>
                          {text}
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>

                {/* Persona 3 — Je veux l'intégrer dans mon système */}
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition-colors list-none">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                        <Code2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">🛠️ Je veux l&apos;intégrer dans mon système</p>
                        <p className="text-xs text-text-secondary">Je maîtrise les outils et cherche les détails techniques</p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-text-secondary transition-transform group-open:rotate-180 shrink-0" />
                  </summary>
                  <div className="px-6 pb-5 pt-2 space-y-3">
                    <div className="rounded-xl bg-purple-50 border border-purple-100 p-3 text-xs text-purple-700">
                      <p className="font-semibold mb-1">Stack technique de ce workflow</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[workflow.tool, ...workflow.tools_connected].filter((v,i,a)=>a.indexOf(v)===i).map(t => (
                          <code key={t} className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[11px]">{t}</code>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-text-primary">Ce que tu peux faire :</p>
                    <ul className="space-y-2">
                      {[
                        'Forker le workflow et adapter les nœuds à ton infra existante',
                        'Remplacer les services proposés par tes propres endpoints (webhooks, APIs REST)',
                        'Ajouter des transformations custom (fonctions JavaScript/Python dans les nœuds)',
                        'Containeriser avec Docker et déployer en self-hosted (N8N, Make Enterprise)',
                        'Connecter à ta DB via le nœud Database ou une API maison',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {workflow.source_url && (
                      <a href={workflow.source_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline font-medium">
                        <ExternalLink className="h-3.5 w-3.5" /> Voir le code source complet →
                      </a>
                    )}
                  </div>
                </details>

              </div>
            </motion.div>

            {/* ── How to use ── */}
            {workflow.how_to_use && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  🚀 Guide de déploiement
                </h2>
                <div className="space-y-3">
                  {workflow.how_to_use.split('\n').filter(l => l.trim()).map((line, i) => {
                    const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').trim();
                    if (!cleaned) return null;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">{cleaned}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Prerequisites checklist ── */}
            {workflow.prerequisites && (
              <PrerequisiteChecklist text={workflow.prerequisites} />
            )}

            {/* ── Upvote + Quick stars ── */}
            <QuickRating workflowId={workflow.id} initialCount={workflow._count.saved_by} />

            {/* ── Similar workflows ── */}
            {workflow.similar && workflow.similar.length > 0 && (
              <SimilarWorkflows workflows={workflow.similar} currentTool={workflow.tool} />
            )}
          </div>

          {/* ═══════════════════════════
              SIDEBAR (1/3)
          ═══════════════════════════ */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* CTA card */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm">

              <div className="text-center">
                <p className="text-2xl font-heading font-bold text-text-primary">
                  {workflow.price === 0 ? 'Gratuit' : `${workflow.price.toFixed(2)} €`}
                </p>
                {workflow.price === 0 && <p className="text-xs text-success-600 mt-0.5">✅ Open source</p>}
              </div>

              <div className="mt-4 space-y-2">
                {workflow.source_url && (
                  <a href={workflow.source_url} target="_blank" rel="noopener noreferrer"
                    id={`workflow-source-${workflow.slug}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 active:scale-[0.98] transition-all">
                    <ExternalLink className="h-4 w-4" />
                    Voir la source {source ? `sur ${source.label}` : ''}
                  </a>
                )}

                <button onClick={handleSave} id={`workflow-save-${workflow.slug}`}
                  disabled={saveLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-70
                    ${saved ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-border text-text-secondary hover:border-primary-300 hover:text-primary-600'}`}>
                  {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className={`h-4 w-4 ${saved ? 'fill-primary-600' : ''}`} />}
                  {saveMsg || (saved ? 'Sauvegardé' : 'Sauvegarder')}
                </button>

                <div className="flex gap-2">
                  <button onClick={handleShare} id={`workflow-share-${workflow.slug}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-text-secondary hover:border-primary-300 hover:text-primary-600 transition-colors">
                    <Share2 className="h-3.5 w-3.5" />
                    {shareMsg || 'Partager'}
                  </button>
                  <button id={`workflow-report-${workflow.slug}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-text-secondary hover:border-danger-300 hover:text-danger-600 transition-colors">
                    <Flag className="h-3.5 w-3.5" />
                    Signaler
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{workflow.views.toLocaleString('fr-FR')}</p>
                  <p className="text-xs text-text-secondary">vues</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{workflow._count.saved_by}</p>
                  <p className="text-xs text-text-secondary">sauvegardes</p>
                </div>
              </div>
            </motion.div>

            {/* Affiliate tools */}
            {workflow.tools_connected.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-text-primary mb-1">🔗 Essayer les outils</h3>
                <p className="text-xs text-text-secondary mb-3">Tous les outils de ce workflow</p>
                <div className="flex flex-wrap gap-2">
                  {[workflow.tool, ...workflow.tools_connected]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .slice(0, 6)
                    .map(t => (
                      <AffiliateButton key={t} tool={t} workflowId={workflow.id} />
                    ))}
                </div>
              </motion.div>
            )}

            {/* Author card — featured */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-text-primary mb-3">👤 Auteur</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-lg font-bold text-white shadow-md">
                  {workflow.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-text-primary">{workflow.author.name}</p>
                    {workflow.author.role === 'seller' && (
                      <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold text-primary-600">✓ Vérifié</span>
                    )}
                  </div>
                  {workflow.author.bio && (
                    <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">{workflow.author.bio}</p>
                  )}
                </div>
              </div>

              {/* Author links */}
              <div className="mt-3 flex flex-wrap gap-2">
                {workflow.author.github_url && (
                  <a href={workflow.author.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-secondary hover:text-primary-600 hover:border-primary-300 transition-colors">
                    <GitBranch className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {workflow.author.website_url && (
                  <a href={workflow.author.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-secondary hover:text-primary-600 hover:border-primary-300 transition-colors">
                    <Globe className="h-3.5 w-3.5" /> Site web
                  </a>
                )}
                {workflow.source_url && (
                  <a href={workflow.source_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-secondary hover:text-primary-600 hover:border-primary-300 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" /> {source?.label || 'Source originale'}
                  </a>
                )}
              </div>

              {/* Source platform info */}
              {source && (
                <div className={`mt-3 flex items-center gap-2 rounded-lg border p-2.5 text-xs ${source.color}`}>
                  <span className="text-base">{source.emoji}</span>
                  <div>
                    <p className="font-medium">Récupéré depuis {source.label}</p>
                    {workflow.source_stars > 0 && (
                      <p className="opacity-80">⭐ {workflow.source_stars.toLocaleString('fr-FR')} étoiles sur la plateforme</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Back link */}
            <Link href="/recherche"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-600 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Retour aux workflows
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
