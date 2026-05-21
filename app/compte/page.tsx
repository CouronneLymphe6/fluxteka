'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Globe, ExternalLink, Save, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function MonProfilPage() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getUser().then(({ data }: any) => {
      if (data.user) {
        const meta = data.user.user_metadata || {};
        setEmail(data.user.email || '');
        setName(meta.name || meta.full_name || '');
        setBio(meta.bio || '');
        setWebsite(meta.website_url || '');
        setGithubUrl(meta.github_url || '');
      }
      setLoading(false);
    });
    // Sync user to Prisma DB on page load
    fetch('/api/user/sync', { method: 'POST' }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      // Save to Supabase metadata
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: { name, bio, website_url: website, github_url: githubUrl },
      });
      // Sync to Prisma DB
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, website_url: website, github_url: githubUrl }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Mon profil</h1>
        <p className="mt-1 text-sm text-text-secondary">Gère tes informations personnelles.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm">
        {/* Avatar + email (read-only) */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
            {name.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-text-primary">{name || 'Utilisateur'}</p>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Mail className="h-3 w-3" />
              {email}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="profile-name" className="block text-xs font-medium text-text-secondary mb-1.5">
            Nom / Pseudo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input id="profile-name" value={name} onChange={e => setName(e.target.value)}
              placeholder="Jean-Pierre"
              className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="profile-bio" className="block text-xs font-medium text-text-secondary mb-1.5">
            Bio <span className="font-normal text-text-secondary/60">({bio.length}/200)</span>
          </label>
          <textarea id="profile-bio" value={bio} onChange={e => setBio(e.target.value)}
            maxLength={200} rows={3} placeholder="Expert en automatisation N8N..."
            className="w-full rounded-xl border border-border py-2.5 px-4 text-sm resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="profile-website" className="block text-xs font-medium text-text-secondary mb-1.5">
            Site web
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input id="profile-website" type="url" value={website} onChange={e => setWebsite(e.target.value)}
              placeholder="https://monsite.fr"
              className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
          </div>
        </div>

        {/* GitHub */}
        <div>
          <label htmlFor="profile-github" className="block text-xs font-medium text-text-secondary mb-1.5">
            GitHub
          </label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input id="profile-github" type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
              placeholder="https://github.com/monpseudo"
              className="w-full rounded-xl border border-border py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-70 active:scale-[0.98]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </button>
          {saved && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-sm text-success-600">
              <CheckCircle className="h-4 w-4" /> Sauvegardé
            </motion.span>
          )}
        </div>
      </form>
    </div>
  );
}
