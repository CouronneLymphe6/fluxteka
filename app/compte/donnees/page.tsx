'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Database, Download, Trash2, AlertTriangle, Loader2, Shield, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function MesDonneesPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Fluxteka-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setExported(true);
      }
    } catch { /* ignore */ }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') return;
    setDeleting(true);
    try {
      // Delete all data from Prisma DB
      await fetch('/api/user', { method: 'DELETE' });
      // Sign out from Supabase
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch { /* ignore */ }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Mes données</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Gère tes données personnelles conformément au RGPD.
        </p>
      </div>

      {/* RGPD Info */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-5">
        <Shield className="h-5 w-5 shrink-0 text-primary-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-primary-800">Protection de tes données</p>
          <p className="mt-1 text-xs text-primary-700 leading-relaxed">
            Conformément au RGPD, tu as le droit d&apos;accéder, rectifier, exporter et supprimer tes données personnelles à tout moment. Tes données ne sont jamais vendues à des tiers.
          </p>
        </div>
      </div>

      {/* Export */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <Download className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-text-primary">Exporter mes données</h2>
            <p className="text-xs text-text-secondary">Télécharge un fichier JSON contenant toutes tes données.</p>
          </div>
        </div>
        <ul className="ml-13 mb-4 space-y-1 text-xs text-text-secondary">
          <li>• Profil (nom, email, bio)</li>
          <li>• Workflows sauvegardés</li>
          <li>• Avis laissés</li>
          <li>• Historique d&apos;activité</li>
        </ul>
        {exported ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-success-600">
            <CheckCircle className="h-4 w-4" />
            Export envoyé par email. Vérifie ta boîte de réception.
          </motion.div>
        ) : (
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 rounded-xl border border-primary-300 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-60">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exporter mes données
          </button>
        )}
      </div>

      {/* Delete Account */}
      <div className="rounded-2xl border border-danger-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-100">
            <Trash2 className="h-5 w-5 text-danger-600" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-danger-700">Supprimer mon compte</h2>
            <p className="text-xs text-text-secondary">Action irréversible. Toutes tes données seront supprimées.</p>
          </div>
        </div>

        {!showDeleteModal ? (
          <button onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 rounded-xl border border-danger-300 px-4 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50">
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 rounded-xl border border-danger-300 bg-danger-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-danger-700 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Cette action est irréversible
            </div>
            <p className="text-xs text-danger-600 mb-3">
              Cela supprimera : ton profil, tes sauvegardes, tes avis, et toute donnée associée.
              Tape <span className="font-bold">SUPPRIMER</span> pour confirmer.
            </p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full rounded-lg border border-danger-300 px-3 py-2 text-sm focus:border-danger-500 focus:ring-1 focus:ring-danger-200 focus:outline-none mb-3" />
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'SUPPRIMER' || deleting}
                className="flex items-center gap-2 rounded-lg bg-danger-600 px-4 py-2 text-sm font-medium text-white hover:bg-danger-700 disabled:opacity-50">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirmer la suppression
              </button>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
