'use client';

import { Star, Clock, Download, Filter } from 'lucide-react';
import { FILTER_TOOLS } from '@/lib/platforms';

const sorts = [
  { value: 'score', label: 'Mieux notés', icon: '⭐' },
  { value: 'recent', label: 'Récents', icon: '🕐' },
  { value: 'downloads', label: 'Plus téléchargés', icon: '📥' },
];

interface FilterBarProps {
  selectedTool: string;
  selectedSort: string;
  onToolChange: (tool: string) => void;
  onSortChange: (sort: string) => void;
}

export default function FilterBar({ selectedTool, selectedSort, onToolChange, onSortChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Tool Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TOOLS.map((tool) => (
          <button
            key={tool.value}
            onClick={() => onToolChange(tool.value)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              selectedTool === tool.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-border text-text-secondary hover:border-primary-300 hover:text-primary-600'
            }`}
            id={`filter-tool-${tool.value || 'all'}`}
          >
            <span className="text-xs">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-1.5">
        {sorts.map((sort) => (
          <button
            key={sort.value}
            onClick={() => onSortChange(sort.value)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              selectedSort === sort.value
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-text-secondary hover:text-primary-600'
            }`}
            id={`filter-sort-${sort.value}`}
          >
            <span>{sort.icon}</span>
            <span className="hidden sm:inline">{sort.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
