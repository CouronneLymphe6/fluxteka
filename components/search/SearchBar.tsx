'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const placeholders = [
  'Que voulez-vous automatiser ?',
  'Envoyer un email automatiquement...',
  'Notifier Slack à chaque vente...',
  'Publier sur LinkedIn automatiquement...',
  'Résumer un PDF avec IA...',
];

interface Suggestion {
  title: string;
  category: string;
  slug: string;
}

interface SearchBarProps {
  large?: boolean;
  initialQuery?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ large = false, initialQuery = '', autoFocus = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Animated placeholder
  useEffect(() => {
    if (query) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [query]);

  // Debounced search suggestions
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
      // Silently fail for suggestions
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, fetchSuggestions]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    }
    if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      router.push(`/workflow/${suggestions[selectedIndex].slug}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center ${large ? 'group' : ''}`}>
          <Search className={`absolute left-4 ${large ? 'h-5 w-5' : 'h-4 w-4'} text-text-secondary transition-colors group-focus-within:text-primary-500`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[placeholderIndex]}
            autoFocus={autoFocus}
            className={`w-full rounded-xl border border-border bg-white transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none ${
              large
                ? 'py-4 pl-12 pr-14 text-lg shadow-lg shadow-primary-100/30'
                : 'py-2.5 pl-10 pr-10 text-sm'
            }`}
            id="search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
              className={`absolute ${large ? 'right-14' : 'right-10'} rounded-md p-1 text-text-secondary hover:text-text-primary`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className={`absolute right-2 rounded-lg bg-primary-600 text-white transition-all hover:bg-primary-700 active:scale-95 ${
              large ? 'p-3' : 'p-2'
            }`}
            id="search-submit"
          >
            <ArrowRight className={large ? 'h-5 w-5' : 'h-4 w-4'} />
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-white shadow-xl shadow-black/5 overflow-hidden"
          >
            {suggestions.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => {
                  router.push(`/workflow/${s.slug}`);
                  setShowSuggestions(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                  i === selectedIndex ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{s.title}</span>
                <span className="text-xs text-text-secondary">{s.category}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
