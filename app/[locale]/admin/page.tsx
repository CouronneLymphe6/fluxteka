'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle, XCircle, Eye, Clock, TrendingUp,
  Database, Users, Workflow, AlertTriangle, BarChart3, Loader2
} from 'lucide-react';

interface PendingWorkflow {
  id: string;
  title: string;
  tool: string;
  source_type: string;
  category: string;
  score_total: number;
  created_at: string;
  source_url?: string;
}

interface Stats {
  totalWorkflows: number;
  pendingWorkflows: number;
  totalUsers: number;
  totalReviews: number;
  totalReports: number;
  pipelineRuns: number;
  totalCostUsd: number;
}

export default function AdminDashboard() {
  const [pending, setPending] = useState<PendingWorkflow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          setDenied(true);
          setLoading(false);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(data => {
        if (data) {
          setStats(data.stats);
          setPending(data.pendingModeration || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);


  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      setPending(p => p.filter(w => w.id !== id));
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      setPending(p => p.filter(w => w.id !== id));
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const toolColors: Record<string, string> = {
    n8n: 'bg-orange-100 text-orange-700',
    make: 'bg-purple-100 text-purple-700',
    zapier: 'bg-orange-50 text-orange-600',
    langchain: 'bg-emerald-100 text-emerald-700',
    crewai: 'bg-blue-100 text-blue-700',
    autogen: 'bg-sky-100 text-sky-700',
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Shield className="h-12 w-12 text-danger-400" />
        <h1 className="font-heading text-2xl font-bold text-text-primary">Accès refusé</h1>
        <p className="text-sm text-text-secondary">Cette page est réservée aux administrateurs.</p>
        <a href="/" className="text-sm text-primary-600 hover:underline">← Retour au site</a>
      </div>
    );
  }


  const statCards = [
    { label: 'Workflows', value: stats?.totalWorkflows || 0, icon: Workflow, color: 'bg-primary-100 text-primary-600' },
    { label: 'En attente', value: stats?.pendingWorkflows || 0, icon: Clock, color: 'bg-accent-100 text-accent-600' },
    { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Avis', value: stats?.totalReviews || 0, icon: BarChart3, color: 'bg-sky-100 text-sky-600' },
    { label: 'Signalements', value: stats?.totalReports || 0, icon: AlertTriangle, color: 'bg-danger-100 text-danger-600' },
    { label: 'Coût IA ($)', value: `$${(stats?.totalCostUsd || 0).toFixed(2)}`, icon: Database, color: 'bg-violet-100 text-violet-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-border bg-white">
        <div className="container-page py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary-600" />
            <h1 className="font-heading text-xl font-bold text-text-primary">Admin Fluxteka</h1>
          </div>
          <Link href="/" className="text-sm text-text-secondary hover:text-primary-600">
            ← Retour au site
          </Link>
        </div>
      </div>

      <div className="container-page py-6 space-y-6">
        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">{card.label}</p>
                  <p className="text-lg font-bold text-text-primary">
                    {typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={() => { /* TODO: trigger pipeline */ }}
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm text-left hover:border-primary-300 hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-text-primary text-sm">Lancer le pipeline</p>
              <p className="text-xs text-text-secondary">Déclencher un crawl manuel</p>
            </div>
          </button>
          <Link href="/admin/reports"
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm text-left hover:border-primary-300 hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-100">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
            </div>
            <div>
              <p className="font-medium text-text-primary text-sm">Signalements</p>
              <p className="text-xs text-text-secondary">{stats?.totalReports || 0} à traiter</p>
            </div>
          </Link>
          <Link href="/admin/leads"
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm text-left hover:border-primary-300 hover:shadow-md transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100">
              <Users className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <p className="font-medium text-text-primary text-sm">Leads waitlist</p>
              <p className="text-xs text-text-secondary">Premium & partenaires</p>
            </div>
          </Link>
        </div>

        {/* Pending moderation */}
        <div className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-4 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-text-primary flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-600" />
              Workflows en attente ({pending.length})
            </h2>
          </div>

          {pending.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-success-400" />
              <p className="mt-2 text-sm text-text-secondary">Aucun workflow en attente de modération.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pending.map((wf) => (
                <div key={wf.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${
                      toolColors[wf.tool] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {wf.tool}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{wf.title}</p>
                      <p className="text-xs text-text-secondary">
                        {wf.source_type} · Score: {wf.score_total.toFixed(1)} · {new Date(wf.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    {wf.source_url && (
                      <a href={wf.source_url} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg p-2 text-text-secondary hover:bg-gray-100 hover:text-primary-600">
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    <button onClick={() => handleApprove(wf.id)}
                      disabled={actionLoading === wf.id}
                      className="rounded-lg p-2 text-success-600 hover:bg-success-50">
                      {actionLoading === wf.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleReject(wf.id)}
                      disabled={actionLoading === wf.id}
                      className="rounded-lg p-2 text-danger-600 hover:bg-danger-50">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
