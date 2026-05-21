export function calculateScore(data: {
  avgRating: number;
  ratingCount: number;
  views: number;
  sourceStars: number;
  lastCheckedAt: Date;
  reportCount: number;
}): { total: number; users: number; popularity: number; freshness: number; reports: number } {

  const users = data.ratingCount > 0
    ? (data.avgRating / 5) * 10
    : 5; // neutre si pas encore de notes

  const totalPop = data.views + data.sourceStars * 2;
  const popularity = Math.min(10, Math.log10(totalPop + 1) * 2.5);

  const days = Math.floor((Date.now() - data.lastCheckedAt.getTime()) / 86400000);
  const freshness = days < 30 ? 10 : days < 90 ? 7 : days < 180 ? 4 : 1;

  const reports = data.reportCount === 0 ? 10
    : data.reportCount === 1 ? 7
    : data.reportCount === 2 ? 4 : 0;

  const total = (users * 0.40) + (popularity * 0.25) + (freshness * 0.20) + (reports * 0.15);

  return {
    total: Math.round(total * 10) / 10,
    users: Math.round(users * 10) / 10,
    popularity: Math.round(popularity * 10) / 10,
    freshness,
    reports,
  };
}
