import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';

// Niveau 1 : Normalisation d'URL
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Supprimer paramètres tracking communs
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
      'utm_term', 'ref', 'source', 'fbclid', 'gclid'].forEach(p => u.searchParams.delete(p));
    return u.origin + u.pathname.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

// Niveau 2 : Empreinte du contenu
export function contentFingerprint(rawContent: string): string {
  const normalized = rawContent
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim()
    .substring(0, 1000);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Niveau 3 : Distance de Levenshtein pour similarité de titres
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

export function titleSimilarity(a: string, b: string): number {
  const na = a.toLowerCase(), nb = b.toLowerCase();
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(na, nb) / maxLen;
}

// Vérification complète des 3 niveaux automatiques
export async function isDuplicate(
  url: string,
  rawContent: string,
  enrichedTitle: string,
  prisma: PrismaClient
): Promise<{ isDup: boolean; level: string; matchId?: string }> {

  const normalized = normalizeUrl(url);

  // Niveau 1 : URL normalisée
  const urlMatch = await prisma.crawledUrl.findFirst({
    where: { url_normalized: normalized },
  });
  if (urlMatch) return { isDup: true, level: 'url', matchId: urlMatch.workflow_id ?? undefined };

  // Niveau 2 : Empreinte contenu
  const fingerprint = contentFingerprint(rawContent);
  const contentMatch = await prisma.crawledUrl.findFirst({
    where: { content_fingerprint: fingerprint },
  });
  if (contentMatch) return { isDup: true, level: 'content', matchId: contentMatch.workflow_id ?? undefined };

  // Niveau 3 : Similarité de titre (seulement après enrichissement IA)
  if (enrichedTitle) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentWorkflows = await prisma.workflow.findMany({
      where: { status: { in: ['active', 'pending'] }, created_at: { gt: thirtyDaysAgo } },
      select: { id: true, title: true },
    });
    for (const w of recentWorkflows) {
      const sim = titleSimilarity(enrichedTitle, w.title);
      if (sim > 0.85) {
        // Quasi-doublon → révision admin, pas rejet automatique
        return { isDup: false, level: 'title_review', matchId: w.id };
      }
    }
  }

  return { isDup: false, level: 'none' };
}

// Récupération robuste du JSON généré par Claude
export function parseAIResponse(raw: string): Record<string, unknown> | null {
  // Tentative 1 : parse direct
  try { return JSON.parse(raw); } catch { /* continue */ }
  // Tentative 2 : extraire le JSON du texte
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch { /* continue */ } }
  // Tentative 3 : nettoyer les backticks markdown
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try { return JSON.parse(cleaned); } catch { /* continue */ }
  return null; // Échec → sera marqué error dans PipelineLog
}
