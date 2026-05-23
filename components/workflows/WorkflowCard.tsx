'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Bookmark, Flag, Clock, Zap, CheckCircle } from 'lucide-react';
import ScoreBadge from './ScoreBadge';

export interface WorkflowData {
  id: string;
  slug: string;
  title: string;
  description_fr: string;
  tool: string;
  tools_connected?: string[];
  category: string;
  tags?: string[];
  source_type?: string;
  status: string;
  score_total: number;
  score_users?: number;
  score_popularity?: number;
  score_freshness?: number;
  score_reports?: number;
  views?: number;
  downloads?: number;
  price?: number;
  is_premium?: boolean;
  difficulty?: string | null;
  setup_time_minutes?: number | null;
  verified_at?: string | null;
  author: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  created_at: string;
}

// ── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: Record<string, {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  emoji: string;
}> = {
  n8n: {
    label: 'n8n',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    emoji: '🔶',
  },
  make: {
    label: 'Make',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    emoji: '🟣',
  },
  zapier: {
    label: 'Zapier',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    emoji: '⚡',
  },
  langchain: {
    label: 'LangChain',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    emoji: '🦜',
  },
  activepieces: {
    label: 'Activepieces',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
    emoji: '🔵',
  },
};

const DEFAULT_PLATFORM = {
  label: 'Autre',
  bg: 'bg-gray-50',
  text: 'text-gray-600',
  border: 'border-gray-200',
  dot: 'bg-gray-400',
  emoji: '🔧',
};

// ── Difficulty ────────────────────────────────────────────────────────────────

function getDifficulty(workflow: WorkflowData): { label: string; color: string; icon: string } {
  // Use explicit difficulty field if set
  const d = workflow.difficulty?.toLowerCase();
  if (d === 'beginner' || d === 'débutant') return { label: 'Débutant', color: 'text-emerald-600', icon: '🟢' };
  if (d === 'intermediate' || d === 'intermédiaire') return { label: 'Intermédiaire', color: 'text-amber-600', icon: '🟡' };
  if (d === 'advanced' || d === 'avancé') return { label: 'Avancé', color: 'text-rose-600', icon: '🔴' };
  // Derive from tools_connected count
  const toolCount = (workflow.tools_connected ?? []).length;
  if (toolCount >= 4) return { label: 'Avancé', color: 'text-rose-600', icon: '🔴' };
  if (toolCount >= 2) return { label: 'Intermédiaire', color: 'text-amber-600', icon: '🟡' };
  return { label: 'Débutant', color: 'text-emerald-600', icon: '🟢' };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkflowCard({
  workflow,
  compact = false,
}: {
  workflow: WorkflowData;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const platform = PLATFORMS[workflow.tool.toLowerCase()] || DEFAULT_PLATFORM;
  const difficulty = getDifficulty(workflow);
  const isVerified = !!workflow.verified_at;
  const setupTime = workflow.setup_time_minutes;

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-white shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/50 overflow-hidden"
    >
      {/* Top accent bar — platform color */}
      <div className={`h-1 w-full ${platform.dot}`} />

      <div className="flex flex-col flex-1 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Platform badge */}
          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${platform.bg} ${platform.text} ${platform.border}`}>
            <span>{platform.emoji}</span>
            {platform.label}
          </span>

          {/* Views */}
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Eye className="h-3.5 w-3.5" />
            <span>{(workflow.views ?? 0).toLocaleString('fr-FR')}</span>
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/workflow/${workflow.slug}`}
          className="mt-3 text-base font-heading font-semibold text-text-primary transition-colors group-hover:text-primary-600 line-clamp-2 leading-snug"
          id={`workflow-card-${workflow.slug}`}
        >
          {workflow.title}
        </Link>

        {/* Description */}
        {!compact && (
          <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-2">
            {workflow.description_fr}
          </p>
        )}

        {/* Metadata row — difficulty + setup time */}
        <div className="mt-3 flex items-center gap-3">
          <span className={`flex items-center gap-1 text-xs font-medium ${difficulty.color}`}>
            <span>{difficulty.icon}</span>
            {difficulty.label}
          </span>
          {setupTime && (
            <>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock className="h-3 w-3" />
                ~{setupTime} min
              </span>
            </>
          )}
          {isVerified && (
            <>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle className="h-3 w-3" />
                Vérifié
              </span>
            </>
          )}
        </div>

        {/* Score */}
        <div className="mt-3">
          <ScoreBadge
            total={workflow.score_total}
            users={workflow.score_users ?? 0}
            popularity={workflow.score_popularity ?? 0}
            freshness={workflow.score_freshness ?? 0}
            reports={workflow.score_reports ?? 0}
            compact
          />
        </div>

        {/* Tools connected */}
        {(workflow.tools_connected ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(workflow.tools_connected ?? []).slice(0, 4).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-gray-50 px-2 py-0.5 text-xs text-text-secondary"
              >
                <Zap className="h-2.5 w-2.5 text-primary-400" />
                {t}
              </span>
            ))}
            {(workflow.tools_connected ?? []).length > 4 && (
              <span className="inline-flex items-center rounded-md border border-border bg-gray-50 px-2 py-0.5 text-xs text-text-secondary">
                +{(workflow.tools_connected ?? []).length - 4}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <Link
            href={`/workflow/${workflow.slug}`}
            className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Voir le workflow →
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSaved(!saved)}
              className={`rounded-lg p-1.5 transition-colors ${saved ? 'bg-primary-50 text-primary-600' : 'text-text-secondary hover:bg-primary-50 hover:text-primary-600'}`}
              title="Sauvegarder"
              aria-label="Sauvegarder"
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button
              className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger-50 hover:text-danger-600"
              title="Signaler"
              aria-label="Signaler"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
