'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Mail, Globe, DollarSign, Calendar, CheckCircle, XCircle, Clock, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';

interface Lead {
  id: string;
  type: string;
  email: string;
  name: string | null;
  company: string | null;
  website: string | null;
  message: string | null;
  budget: string | null;
  tool: string | null;
  notified: boolean;
  converted: boolean;
  created_at: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  expert_request: { label: 'Demande expert', color: 'bg-indigo-100 text-indigo-700', icon: '🎯' },
  agency: { label: 'Candidature agence', color: 'bg-purple-100 text-purple-700', icon: '🏢' },
  premium: { label: 'Lead premium', color: 'bg-amber-100 text-amber-700', icon: '⭐' },
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expert_request' | 'agency'>('all');
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    // Fetch leads from admin API
    fetch('/api/admin/dashboard')
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          setDenied(true);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(data => {
        if (data?.leads) setLeads(data.leads);
        else if (data) {
          // Dashboard doesn't return leads yet — fetch separately
          fetch('/api/leads', {
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET || 'fluxteka-admin-2026'}` },
          })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.leads) setLeads(d.leads); });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleConverted = async (id: string, current: boolean) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, converted: !current } : l));
    // Optimistic — no backend update yet (MVP)
  };

  const filtered = filter === 'all' ? leads : leads.filter(l => l.type === filter);

  const stats = {
    total: leads.length,
    expertRequests: leads.filter(l => l.type === 'expert_request').length,
    agencies: leads.filter(l => l.type === 'agency').length,
    converted: leads.filter(l => l.converted).length,
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
    </div>
  );

  if (denied) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
      <Link href="/" className="text-sm text-indigo-600 hover:underline">← Retour au site</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Leads & Experts</h1>
            </div>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">← Site</Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total leads', value: stats.total, icon: '📊', color: 'bg-gray-100' },
            { label: 'Demandes expert', value: stats.expertRequests, icon: '🎯', color: 'bg-indigo-50' },
            { label: 'Candidatures agence', value: stats.agencies, icon: '🏢', color: 'bg-purple-50' },
            { label: 'Convertis', value: stats.converted, icon: '✅', color: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border border-gray-200 ${s.color} p-4`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'expert_request', 'agency'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'expert_request' ? '🎯 Demandes expert' : '🏢 Agences'}
              {' '}({f === 'all' ? stats.total : f === 'expert_request' ? stats.expertRequests : stats.agencies})
            </button>
          ))}
        </div>

        {/* Leads list */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 text-sm">Aucun lead pour le moment.</p>
              <p className="text-gray-400 text-xs mt-1">Les demandes "Trouver un expert" et candidatures agences apparaîtront ici.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(lead => {
                const typeInfo = TYPE_LABELS[lead.type] || { label: lead.type, color: 'bg-gray-100 text-gray-700', icon: '📋' };
                return (
                  <div key={lead.id} className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Type badge */}
                      <span className="text-xl shrink-0 mt-0.5">{typeInfo.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {lead.tool && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {lead.tool}
                            </span>
                          )}
                          {lead.notified && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              ✉️ Notifié
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <a href={`mailto:${lead.email}`} className="font-medium hover:text-indigo-600 truncate">
                            {lead.email}
                          </a>
                        </div>
                        {lead.name && (
                          <p className="text-xs text-gray-600 mb-0.5">
                            👤 {lead.name}{lead.company ? ` — ${lead.company}` : ''}
                          </p>
                        )}
                        {lead.message && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1 bg-gray-50 rounded-lg px-3 py-2">
                            <MessageSquare className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                            {lead.message}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          {lead.budget && <span>💰 {lead.budget}</span>}
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 flex items-center gap-1">
                              <Globe className="h-3 w-3" /> {lead.website.replace(/https?:\/\//, '')}
                            </a>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleConverted(lead.id, lead.converted)}
                        className={`rounded-lg p-2 transition-colors ${lead.converted ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                        title={lead.converted ? 'Marquer non converti' : 'Marquer converti'}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <a
                        href={`mailto:${lead.email}?subject=Votre demande Fluxteka&body=Bonjour,%0A%0AMerci pour votre demande sur Fluxteka.%0A%0A`}
                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Répondre par email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>MVP Note :</strong> Les leads sont stockés en base via <code>/api/leads</code> (type: expert_request) et <code>/api/agences/register</code> (type: agency).
          Les conversions sont gérées manuellement ici. La prochaine étape sera d'ajouter un système de notification Slack/email automatique.
        </div>
      </div>
    </div>
  );
}
