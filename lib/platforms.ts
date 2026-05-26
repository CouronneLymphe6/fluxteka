// ═══════════════════════════════════════════════════════════════════════════
// lib/platforms.ts — Centralized platform tokens for Fluxteka
// ═══════════════════════════════════════════════════════════════════════════

// ── Card / badge styling per platform ────────────────────────────────────

export interface PlatformStyle {
  label: string;
  slug: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  emoji: string;
  /** Hex color for gradient bars / accent */
  hex: string;
  /** Lighter hex for gradient end */
  hexLight: string;
  description?: string;
}

export const PLATFORMS: Record<string, PlatformStyle> = {
  n8n: {
    label: 'n8n',
    slug: 'n8n',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    emoji: '🔶',
    hex: '#F97316',
    hexLight: '#FDBA74',
    description: 'Open-source & self-hosted',
  },
  make: {
    label: 'Make',
    slug: 'make',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    emoji: '🟣',
    hex: '#A855F7',
    hexLight: '#D8B4FE',
    description: 'Visuel & puissant',
  },
  zapier: {
    label: 'Zapier',
    slug: 'zapier',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    emoji: '⚡',
    hex: '#F59E0B',
    hexLight: '#FCD34D',
    description: 'Le plus simple',
  },
  langchain: {
    label: 'LangChain',
    slug: 'langchain',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    emoji: '🦜',
    hex: '#10B981',
    hexLight: '#6EE7B7',
    description: 'Agents IA avancés',
  },
  crewai: {
    label: 'CrewAI',
    slug: 'crewai',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    emoji: '🤖',
    hex: '#3B82F6',
    hexLight: '#93C5FD',
    description: 'Multi-agent AI',
  },
  autogen: {
    label: 'AutoGen',
    slug: 'autogen',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    emoji: '🔵',
    hex: '#0EA5E9',
    hexLight: '#7DD3FC',
    description: 'Microsoft multi-agent',
  },
  flowise: {
    label: 'Flowise',
    slug: 'flowise',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
    emoji: '🌊',
    hex: '#06B6D4',
    hexLight: '#67E8F9',
    description: 'Low-code LLM apps',
  },
  dify: {
    label: 'Dify',
    slug: 'dify',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    emoji: '💎',
    hex: '#6366F1',
    hexLight: '#A5B4FC',
    description: 'LLMOps platform',
  },
  activepieces: {
    label: 'Activepieces',
    slug: 'activepieces',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    emoji: '🧩',
    hex: '#F43F5E',
    hexLight: '#FDA4AF',
    description: 'Open-source automation',
  },
  pipedream: {
    label: 'Pipedream',
    slug: 'pipedream',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
    emoji: '🌀',
    hex: '#22C55E',
    hexLight: '#86EFAC',
    description: 'Serverless automation',
  },
};

export const DEFAULT_PLATFORM: PlatformStyle = {
  label: 'Autre',
  slug: 'other',
  bg: 'bg-gray-50',
  text: 'text-gray-600',
  border: 'border-gray-200',
  dot: 'bg-gray-400',
  emoji: '🔧',
  hex: '#9CA3AF',
  hexLight: '#D1D5DB',
};

/** Get platform config by key (case-insensitive) */
export function getPlatform(key: string): PlatformStyle {
  return PLATFORMS[key.toLowerCase()] || DEFAULT_PLATFORM;
}

// ── Tool colors for detail page ─────────────────────────────────────────

/** Combined badge class string for a tool: bg + text + border */
export function getToolBadgeClass(tool: string): string {
  const p = PLATFORMS[tool.toLowerCase()];
  if (!p) return 'bg-gray-100 text-gray-600 border-gray-200';
  // For detail page we use slightly different shades (100 instead of 50)
  return `${p.bg.replace('-50', '-100')} ${p.text} ${p.border}`;
}

/** Dot color class for a tool */
export function getToolDotClass(tool: string): string {
  const p = PLATFORMS[tool.toLowerCase()];
  return p ? p.dot.replace('-500', '-400') : 'bg-gray-400';
}

// ── Source platform badges (for detail page) ────────────────────────────

export interface SourcePlatformInfo {
  label: string;
  emoji: string;
  color: string;
}

export const SOURCE_PLATFORMS: Record<string, SourcePlatformInfo> = {
  'n8n-community':           { label: 'N8N Community', emoji: '🟠', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  'make-templates':          { label: 'Make Templates', emoji: '🟣', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'zapier-templates':        { label: 'Zapier Templates', emoji: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'activepieces-community':  { label: 'Activepieces', emoji: '🧩', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  'pipedream-apps':          { label: 'Pipedream', emoji: '🌀', color: 'bg-green-50 text-green-700 border-green-200' },
  'flowise-nodes':           { label: 'Flowise', emoji: '🌊', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  'github':                  { label: 'GitHub', emoji: '⚫', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  'reddit':                  { label: 'Reddit', emoji: '🔴', color: 'bg-red-50 text-red-700 border-red-200' },
  'youtube':                 { label: 'YouTube', emoji: '▶️', color: 'bg-red-50 text-red-700 border-red-200' },
};

export const FILTER_TOOLS = [
  { value: '', label: 'Tous', icon: '🔄' },
  { value: 'n8n', label: 'N8N', icon: '🔶' },
  { value: 'activepieces', label: 'Activepieces', icon: '🧩' },
  { value: 'pipedream', label: 'Pipedream', icon: '🌀' },
  { value: 'flowise', label: 'Flowise', icon: '🌊' },
];
