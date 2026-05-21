'use client';

import { useState } from 'react';
import { Star, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreBadgeProps {
  total: number;
  users: number;
  popularity: number;
  freshness: number;
  reports: number;
  compact?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 7) return 'text-success-600';
  if (score >= 4) return 'text-accent-600';
  return 'text-danger-600';
}

function getScoreBg(score: number): string {
  if (score >= 7) return 'bg-success-50 border-success/20';
  if (score >= 4) return 'bg-accent-50 border-accent/20';
  return 'bg-danger-50 border-danger/20';
}

function renderStars(score: number) {
  const fullStars = Math.floor(score / 2);
  const halfStar = score % 2 >= 1;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
      ))}
      {halfStar && (
        <Star className="h-3.5 w-3.5 fill-accent-200 text-accent-500" />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-gray-200" />
      ))}
    </div>
  );
}

export default function ScoreBadge({ total, users, popularity, freshness, reports, compact = false }: ScoreBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const criteria = [
    { label: 'Notes utilisateurs', weight: '40%', score: users, icon: '⭐', color: 'bg-primary-100 text-primary-700' },
    { label: 'Popularité source', weight: '25%', score: popularity, icon: '🔗', color: 'bg-purple-100 text-purple-700' },
    { label: 'Fraîcheur', weight: '20%', score: freshness, icon: '📅', color: 'bg-cyan-100 text-cyan-700' },
    { label: 'Absence signalements', weight: '15%', score: reports, icon: '🚩', color: 'bg-success-100 text-success-700' },
  ];

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-sm font-bold ${getScoreBg(total)} ${getScoreColor(total)}`}>
          {total.toFixed(1)}/10
        </span>
        {renderStars(total)}
        {!compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-primary-600"
            id="score-details-toggle"
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Comment ce score est calculé</span>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-lg border border-border bg-gray-50 p-3 space-y-2">
              {criteria.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{c.icon}</span>
                    <span className="text-xs text-text-secondary">{c.label}</span>
                    <span className="text-xs text-text-secondary opacity-60">{c.weight}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.score >= 7 ? 'bg-success-500' : c.score >= 4 ? 'bg-accent-500' : 'bg-danger-500'}`}
                        style={{ width: `${(c.score / 10) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${getScoreColor(c.score)}`}>
                      {c.score.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
              <p className="pt-1 text-[10px] text-text-secondary italic border-t border-border">
                Tout workflow sous 5/10 est masqué automatiquement
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
