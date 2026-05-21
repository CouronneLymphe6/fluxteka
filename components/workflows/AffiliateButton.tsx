'use client';

import { ExternalLink } from 'lucide-react';

interface AffiliateButtonProps {
  tool: string;
  workflowId?: string;
  url?: string;
  label?: string;
}

export default function AffiliateButton({ tool, workflowId, url, label }: AffiliateButtonProps) {
  const handleClick = async () => {
    try {
      const res = await fetch('/api/affiliate/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, workflow_id: workflowId }),
      });
      if (res.ok) {
        const data = await res.json();
        window.open(data.url || url, '_blank', 'noopener,noreferrer');
      } else if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-all hover:bg-primary-100 hover:border-primary-300 active:scale-[0.97]"
      id={`affiliate-${tool}`}
    >
      <ExternalLink className="h-3 w-3" />
      {label || `Essayer ${tool}`}
    </button>
  );
}
