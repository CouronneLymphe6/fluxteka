'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Download, Bookmark, Flag, ExternalLink } from 'lucide-react';
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
  author: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  created_at: string;
}

const toolColors: Record<string, string> = {
  n8n: 'bg-orange-100 text-orange-700 border-orange-200',
  make: 'bg-purple-100 text-purple-700 border-purple-200',
  zapier: 'bg-orange-50 text-orange-600 border-orange-200',
  langchain: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  other: 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusBadges: Record<string, { label: string; className: string }> = {
  active: { label: 'Gratuit', className: 'bg-success-50 text-success-700 border-success/20' },
  pending: { label: 'En révision', className: 'bg-accent-100 text-accent-700 border-accent/20' },
  review_duplicate: { label: 'Doublon signalé', className: 'bg-danger-50 text-danger-700 border-danger/20' },
};

export default function WorkflowCard({
  workflow,
  compact = false,
}: {
  workflow: WorkflowData;
  compact?: boolean;
}) {
  const badge = statusBadges[workflow.status] || statusBadges.active;
  const toolColor = toolColors[workflow.tool.toLowerCase()] || toolColors.other;

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="group relative flex flex-col rounded-xl border border-border bg-white p-5 transition-all duration-200 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/50"
    >
      {/* Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Eye className="h-3.5 w-3.5" />
          <span>{(workflow.views ?? 0).toLocaleString('fr-FR')}</span>
        </div>
      </div>

      {/* Title */}
      <Link
        href={`/workflow/${workflow.slug}`}
        className="mt-3 text-lg font-heading font-semibold text-text-primary transition-colors group-hover:text-primary-600 line-clamp-2"
        id={`workflow-card-${workflow.slug}`}
      >
        {workflow.title}
      </Link>

      {/* Author */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
          {workflow.author.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs text-text-secondary">{workflow.author.name}</span>
        {workflow.source_type && (
          <span className="text-xs text-text-secondary">
            · via {workflow.source_type}
          </span>
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

      {/* Description */}
      {!compact && (
        <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-3">
          {workflow.description_fr}
        </p>
      )}

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${toolColor}`}>
          {workflow.tool}
        </span>
        {(workflow.tools_connected ?? []).slice(0, 3).map((t) => (
          <span key={t} className="inline-flex items-center rounded-md border border-border bg-gray-50 px-2 py-0.5 text-xs text-text-secondary">
            {t}
          </span>
        ))}
        {(workflow.tools_connected ?? []).length > 3 && (
          <span className="inline-flex items-center rounded-md border border-border bg-gray-50 px-2 py-0.5 text-xs text-text-secondary">
            +{(workflow.tools_connected ?? []).length - 3}
          </span>
        )}
      </div>

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
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"
            title="Sauvegarder"
            aria-label="Sauvegarder"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger-50 hover:text-danger-600"
            title="Signaler un doublon"
            aria-label="Signaler un doublon"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
