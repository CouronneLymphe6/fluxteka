/**
 * Test Scrapers — Teste la connectivité avec chaque source sans écrire en DB
 *
 * Usage: npx tsx scripts/test-scrapers.ts [source]
 * Sources: activepieces, pipedream, flowise, n8n, make, zapier, all (default: all)
 *
 * Ce script effectue un dry-run limité (5-10 items max) pour vérifier :
 * - La connectivité avec chaque API / source
 * - Le format des données retournées
 * - La qualité du contenu extrait
 * Aucune donnée n'est écrite en base de données.
 */

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import type { CrawlerSource, RawWorkflow } from '../lib/pipeline/engine';

// Imports des crawlers
import { N8NCommunityWalker } from '../lib/pipeline/sources/n8n-community';
import { MakeTemplatesCrawler } from '../lib/pipeline/sources/make-templates';
import { ZapierTemplatesCrawler } from '../lib/pipeline/sources/zapier-templates';
import { ActivepiecesCrawler } from '../lib/pipeline/sources/activepieces';
import { PipedreamCrawler } from '../lib/pipeline/sources/pipedream';
import { FlowiseCrawler } from '../lib/pipeline/sources/flowise';

// ── Config ──

const SOURCES: Record<string, () => CrawlerSource> = {
  n8n:          () => new N8NCommunityWalker(),
  make:         () => new MakeTemplatesCrawler(),
  zapier:       () => new ZapierTemplatesCrawler(),
  activepieces: () => new ActivepiecesCrawler(),
  pipedream:    () => new PipedreamCrawler(),
  flowise:      () => new FlowiseCrawler(),
};

const MAX_PER_SOURCE = 5; // Dry-run limité

// ── Test runner ──

interface TestResult {
  source: string;
  status: 'ok' | 'error' | 'empty';
  found: number;
  durationMs: number;
  error?: string;
  sample?: RawWorkflow;
}

async function testSource(name: string, factory: () => CrawlerSource): Promise<TestResult> {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`🔍 Test: ${name}`);
  console.log('─'.repeat(50));

  const source = factory();
  const startTime = Date.now();

  try {
    const results = await source.crawl(MAX_PER_SOURCE);
    const durationMs = Date.now() - startTime;

    if (results.length === 0) {
      console.log(`  ⚠️  Aucun résultat trouvé`);
      return { source: name, status: 'empty', found: 0, durationMs };
    }

    const sample = results[0];
    console.log(`  ✅ ${results.length} résultats en ${durationMs}ms`);
    console.log(`  📌 Exemple:`);
    console.log(`     Titre: ${sample.title}`);
    console.log(`     URL: ${sample.url}`);
    console.log(`     Outil: ${sample.tool}`);
    console.log(`     Source: ${sample.sourceType}`);
    console.log(`     Tags: ${(sample.tags || []).join(', ')}`);
    console.log(`     Contenu (100 chars): ${sample.rawContent.substring(0, 100).replace(/\n/g, ' ')}...`);

    return { source: name, status: 'ok', found: results.length, durationMs, sample };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMsg = String(err).substring(0, 200);
    console.log(`  ❌ Erreur: ${errorMsg}`);
    return { source: name, status: 'error', found: 0, durationMs, error: errorMsg };
  }
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const sourceName = args[0] || 'all';

  console.log('═'.repeat(55));
  console.log('  🧪 Fluxteka — Test Scrapers (Dry-Run)');
  console.log('═'.repeat(55));
  console.log(`Sources: ${sourceName}`);
  console.log(`Max par source: ${MAX_PER_SOURCE}`);
  console.log(`GitHub Token: ${process.env.GITHUB_TOKEN ? '✅ présent' : '⚠️  absent (rate limit 60 req/h)'}`);
  console.log(`Mode: DRY-RUN (aucune écriture en DB)`);

  const sourceNames = sourceName === 'all'
    ? Object.keys(SOURCES)
    : sourceName.split(',').map(s => s.trim());

  const results: TestResult[] = [];

  for (const name of sourceNames) {
    const factory = SOURCES[name];
    if (!factory) {
      console.warn(`\n⚠️  Source inconnue: "${name}"`);
      console.log(`   Sources disponibles: ${Object.keys(SOURCES).join(', ')}`);
      continue;
    }
    const result = await testSource(name, factory);
    results.push(result);
  }

  // ── Rapport final ──
  console.log(`\n${'═'.repeat(55)}`);
  console.log('  📊 RAPPORT FINAL');
  console.log('═'.repeat(55));

  let totalOk = 0, totalEmpty = 0, totalError = 0;

  for (const r of results) {
    const icon = r.status === 'ok' ? '✅' : r.status === 'empty' ? '⚠️ ' : '❌';
    const info = r.status === 'ok'
      ? `${r.found} résultats en ${r.durationMs}ms`
      : r.status === 'empty'
      ? `0 résultats (source vide ou rate-limited?)`
      : `ERREUR: ${r.error}`;

    console.log(`  ${icon} ${r.source.padEnd(20)} ${info}`);

    if (r.status === 'ok') totalOk++;
    else if (r.status === 'empty') totalEmpty++;
    else totalError++;
  }

  console.log('─'.repeat(55));
  console.log(`  Sources OK: ${totalOk} | Vides: ${totalEmpty} | Erreurs: ${totalError}`);
  console.log('═'.repeat(55));

  if (totalError > 0) {
    console.log('\n💡 Conseil: Certaines sources ont échoué. Vérifiez:');
    console.log('   - Votre connexion internet');
    console.log('   - GITHUB_TOKEN dans .env.local pour Activepieces et Flowise');
    console.log('   - Les APIs peuvent être down temporairement');
  }

  if (totalOk === results.length) {
    console.log('\n🎉 Tous les scrapers fonctionnent ! Prêt pour un vrai crawl.');
    console.log('   Utilisez: npx tsx scripts/run-pipeline.ts [source] [maxResults]');
  }

  console.log('');
}

main().catch(async (e) => {
  console.error('❌ Erreur fatale:', e);
  process.exit(1);
});
