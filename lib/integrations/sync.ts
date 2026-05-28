/**
 * lib/integrations/sync.ts
 * Service de synchronisation central — importe les templates depuis les APIs
 * vers la base de données Fluxteka.
 *
 * Utilisé par :
 * - scripts/sync-zapier.ts (standalone)
 * - scripts/sync-make.ts (standalone)
 * - app/api/cron/sync-integrations/route.ts (Vercel Cron)
 */

import crypto from 'crypto';
import slugifyLib from 'slugify';
import type { PrismaClient } from '@prisma/client';

import {
  fetchZapierTemplates,
  getConnectedApps,
  mapZapierCategory,
  type ZapierTemplate,
} from './zapier';

import {
  fetchMakeTemplates,
  getMakeConnectedApps,
  mapMakeCategory,
  type MakeTemplate,
} from './make';

import {
  fetchN8nTemplates,
  getN8nConnectedApps,
  mapN8nCategory,
  type N8nTemplate,
} from './n8n';

export interface SyncResult {
  source: string;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref'].forEach(p => u.searchParams.delete(p));
    return (u.origin + u.pathname).replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

function contentFingerprint(content: string): string {
  const normalized = content
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim()
    .substring(0, 1000);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

async function generateUniqueSlug(prisma: PrismaClient, title: string): Promise<string> {
  const base = slugifyLib(title, { lower: true, strict: true, locale: 'fr' }).substring(0, 80);
  let slug = base;
  let counter = 1;
  while (await (prisma as any).workflow.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

async function getPipelineUser(prisma: PrismaClient) {
  let user = await (prisma as any).user.findFirst({ where: { email: 'pipeline@fluxteka.com' } });
  if (!user) {
    user = await (prisma as any).user.create({
      data: {
        email: 'pipeline@fluxteka.com',
        name: 'Fluxteka Pipeline',
        role: 'seller',
        email_verified: true,
      },
    });
  }
  return user;
}

// ─── Zapier Sync ──────────────────────────────────────────────────────────────

export async function syncZapier(prisma: PrismaClient, maxResults = 2000): Promise<SyncResult> {
  const result: SyncResult = { source: 'zapier', fetched: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };
  const pipelineUser = await getPipelineUser(prisma);

  console.log('\n[Sync Zapier] Récupération des templates...');
  const templates = await fetchZapierTemplates(maxResults, (fetched, total) => {
    process.stdout.write(`\r[Sync Zapier] ${fetched}/${total} récupérés...`);
  });
  console.log();

  result.fetched = templates.length;
  console.log(`[Sync Zapier] ${templates.length} templates à indexer`);

  for (const tpl of templates) {
    try {
      const normUrl = normalizeUrl(tpl.url || `https://zapier.com/apps/zap-templates/${tpl.slug}`);
      const apps = getConnectedApps(tpl);
      const category = mapZapierCategory(tpl);

      const description = [
        tpl.description_plain || '',
        `Apps : ${apps.join(', ')}`,
        `Utilisé ${tpl.creates_count?.toLocaleString('fr-FR') || 0} fois sur Zapier.`,
        `Ce Zap connecte ${apps.join(' → ')} pour automatiser tes tâches sans code.`,
      ].filter(Boolean).join('\n');

      const tags = [
        'zapier', 'zap', 'automation', 'no-code',
        ...apps.map(a => a.toLowerCase().replace(/\s+/g, '-')).slice(0, 6),
      ].slice(0, 10);

      const fingerprint = contentFingerprint(description);

      // Vérifier si déjà indexé
      const existing = await (prisma as any).crawledUrl.findFirst({
        where: { OR: [{ url_normalized: normUrl }, { content_fingerprint: fingerprint }] },
        include: { workflow: true },
      });

      if (existing?.workflow) {
        // Mettre à jour les stats (vues, popularité)
        await (prisma as any).workflow.update({
          where: { id: existing.workflow.id },
          data: {
            source_views: tpl.creates_count || 0,
            source_stars: tpl.creates_count || 0,
            score_popularity: Math.min(10, (tpl.creates_count || 0) / 1000),
          },
        });
        result.updated++;
        continue;
      }

      if (existing) { result.skipped++; continue; }

      const slug = await generateUniqueSlug(prisma, tpl.title);

      const workflow = await (prisma as any).workflow.create({
        data: {
          slug,
          title: tpl.title.substring(0, 200),
          description_fr: description.substring(0, 2000),
          tool: 'zapier',
          tools_connected: JSON.stringify(apps.slice(0, 8)),
          category,
          tags: JSON.stringify(tags),
          source_url: tpl.url || `https://zapier.com/apps/zap-templates/${tpl.slug}`,
          source_type: 'zapier-templates',
          source_stars: tpl.creates_count || 0,
          source_views: tpl.creates_count || 0,
          author_id: pipelineUser.id,
          score_total: 7,
          score_popularity: Math.min(10, (tpl.creates_count || 0) / 1000),
          raw_content: description.substring(0, 10000),
          indexing_source: 'zapier-api',
          status: 'active',
        },
      });

      await (prisma as any).crawledUrl.create({
        data: {
          url: tpl.url || `https://zapier.com/apps/zap-templates/${tpl.slug}`,
          url_normalized: normUrl,
          content_fingerprint: fingerprint,
          source: 'zapier-templates',
          workflow_id: workflow.id,
          status: 'indexed',
        },
      });

      result.inserted++;
      if ((result.inserted + result.updated) % 50 === 0) {
        console.log(`  → ${result.inserted} nouveaux, ${result.updated} mis à jour`);
      }
    } catch (err) {
      result.errors++;
      if (result.errors <= 3) console.error(`  ❌ ${tpl.title?.substring(0, 40)}: ${String(err).substring(0, 100)}`);
    }
  }

  return result;
}

// ─── Make Sync ────────────────────────────────────────────────────────────────

export async function syncMake(prisma: PrismaClient, maxResults = 1500): Promise<SyncResult> {
  const result: SyncResult = { source: 'make', fetched: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };
  const pipelineUser = await getPipelineUser(prisma);

  console.log('\n[Sync Make] Récupération des templates...');
  const templates = await fetchMakeTemplates(maxResults, (fetched) => {
    process.stdout.write(`\r[Sync Make] ${fetched} récupérés...`);
  });
  console.log();

  if (templates.length === 0) {
    console.log('[Sync Make] Aucun template — vérifier MAKE_API_TOKEN');
    return result;
  }

  result.fetched = templates.length;
  console.log(`[Sync Make] ${templates.length} templates à indexer`);

  for (const tpl of templates) {
    try {
      const normUrl = normalizeUrl(tpl.url || `https://www.make.com/en/templates/${tpl.id}`);
      const apps = getMakeConnectedApps(tpl);
      const category = mapMakeCategory(tpl);

      const description = [
        tpl.description || '',
        `Apps connectées : ${apps.join(', ')}`,
        `Utilisé ${tpl.usedCount?.toLocaleString('fr-FR') || 0} fois sur Make.`,
        `Ce scénario Make connecte ${apps.join(' → ')} pour automatiser tes processus.`,
      ].filter(Boolean).join('\n');

      const tags = [
        'make', 'integromat', 'automation', 'scenario', 'no-code',
        ...apps.map(a => a.toLowerCase().replace(/\s+/g, '-')).slice(0, 5),
      ].slice(0, 10);

      const fingerprint = contentFingerprint(description);

      const existing = await (prisma as any).crawledUrl.findFirst({
        where: { OR: [{ url_normalized: normUrl }, { content_fingerprint: fingerprint }] },
        include: { workflow: true },
      });

      if (existing?.workflow) {
        await (prisma as any).workflow.update({
          where: { id: existing.workflow.id },
          data: {
            source_views: tpl.usedCount || 0,
            score_popularity: Math.min(10, (tpl.usedCount || 0) / 500),
          },
        });
        result.updated++;
        continue;
      }

      if (existing) { result.skipped++; continue; }

      const slug = await generateUniqueSlug(prisma, tpl.name);

      const workflow = await (prisma as any).workflow.create({
        data: {
          slug,
          title: tpl.name.substring(0, 200),
          description_fr: description.substring(0, 2000),
          tool: 'make',
          tools_connected: JSON.stringify(apps.slice(0, 8)),
          category,
          tags: JSON.stringify(tags),
          source_url: tpl.url || `https://www.make.com/en/templates/${tpl.id}`,
          source_type: 'make-templates',
          source_stars: tpl.usedCount || 0,
          source_views: tpl.usedCount || 0,
          author_id: pipelineUser.id,
          score_total: 7,
          score_popularity: Math.min(10, (tpl.usedCount || 0) / 500),
          raw_content: description.substring(0, 10000),
          indexing_source: 'make-api',
          status: 'active',
        },
      });

      await (prisma as any).crawledUrl.create({
        data: {
          url: tpl.url || `https://www.make.com/en/templates/${tpl.id}`,
          url_normalized: normUrl,
          content_fingerprint: fingerprint,
          source: 'make-templates',
          workflow_id: workflow.id,
          status: 'indexed',
        },
      });

      result.inserted++;
      if ((result.inserted + result.updated) % 50 === 0) {
        console.log(`  → ${result.inserted} nouveaux, ${result.updated} mis à jour`);
      }
    } catch (err) {
      result.errors++;
      if (result.errors <= 3) console.error(`  ❌ ${tpl.name?.substring(0, 40)}: ${String(err).substring(0, 100)}`);
    }
  }

  return result;
}

// ─── N8n Sync ────────────────────────────────────────────────────────────────

export async function syncN8n(prisma: PrismaClient, maxResults = 1500): Promise<SyncResult> {
  const result: SyncResult = { source: 'n8n', fetched: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };
  const pipelineUser = await getPipelineUser(prisma);

  console.log('\n[Sync n8n] Récupération des templates...');
  const templates = await fetchN8nTemplates(maxResults, (fetched) => {
    process.stdout.write(`\r[Sync n8n] ${fetched} récupérés...`);
  });
  console.log();

  if (templates.length === 0) {
    console.log('[Sync n8n] Aucun template récupéré');
    return result;
  }

  result.fetched = templates.length;
  console.log(`[Sync n8n] ${templates.length} templates à indexer`);

  for (const tpl of templates) {
    try {
      const url = `https://n8n.io/workflows/${tpl.id}`;
      const normUrl = normalizeUrl(url);
      const apps = getN8nConnectedApps(tpl);
      const category = mapN8nCategory(tpl);

      const description = [
        tpl.description || '',
        `Apps connectées : ${apps.join(', ')}`,
        `Ce workflow n8n connecte ${apps.join(' → ')} pour automatiser tes processus de manière flexible et open-source.`,
      ].filter(Boolean).join('\n');

      const tags = [
        'n8n', 'automation', 'workflow', 'open-source', 'self-hosted',
        ...apps.map(a => a.toLowerCase().replace(/\s+/g, '-')).slice(0, 5),
      ].slice(0, 10);

      const fingerprint = contentFingerprint(description);

      const existing = await (prisma as any).crawledUrl.findFirst({
        where: { OR: [{ url_normalized: normUrl }, { content_fingerprint: fingerprint }] },
        include: { workflow: true },
      });

      if (existing?.workflow) {
        // Just skip if it exists and we don't have usage metrics to update
        result.updated++;
        continue;
      }

      if (existing) { result.skipped++; continue; }

      const slug = await generateUniqueSlug(prisma, tpl.name);

      const workflow = await (prisma as any).workflow.create({
        data: {
          slug,
          title: tpl.name.substring(0, 200),
          description_fr: description.substring(0, 2000),
          tool: 'n8n',
          tools_connected: JSON.stringify(apps.slice(0, 8)),
          category,
          tags: JSON.stringify(tags),
          source_url: url,
          source_type: 'n8n-community',
          source_stars: 0,
          source_views: 0,
          author_id: pipelineUser.id,
          score_total: 8,
          score_popularity: 5,
          raw_content: description.substring(0, 10000),
          indexing_source: 'n8n-api',
          status: 'active',
        },
      });

      await (prisma as any).crawledUrl.create({
        data: {
          url: url,
          url_normalized: normUrl,
          content_fingerprint: fingerprint,
          source: 'n8n-community',
          workflow_id: workflow.id,
          status: 'indexed',
        },
      });

      result.inserted++;
      if ((result.inserted + result.updated) % 50 === 0) {
        console.log(`  → ${result.inserted} nouveaux, ${result.updated} mis à jour`);
      }
    } catch (err) {
      result.errors++;
      if (result.errors <= 3) console.error(`  ❌ ${tpl.name?.substring(0, 40)}: ${String(err).substring(0, 100)}`);
    }
  }

  return result;
}
