// lib/rateLimit.ts — In-memory rate limiter for API routes
// Uses a Map to track requests per key within a sliding window.
// Note: resets on each serverless cold start — use Upstash Redis for persistent limits.

import { prisma } from '@/lib/prisma';

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key       Unique key (e.g. `ip:${ip}:reviews`)
 * @param maxReqs   Maximum requests allowed in the window
 * @param windowMs  Window size in milliseconds
 */
export async function rateLimit(key: string, maxReqs: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  
  // Clean up expired (optimistic, don't await)
  prisma.rateLimit.deleteMany({ where: { reset_time: { lt: now } } }).catch(() => {});

  const record = await prisma.rateLimit.findUnique({ where: { key } });

  if (!record || now > record.reset_time) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, reset_time: new Date(Date.now() + windowMs) },
      update: { count: 1, reset_time: new Date(Date.now() + windowMs) }
    });
    return true;
  }

  if (record.count >= maxReqs) return false;
  
  await prisma.rateLimit.update({
    where: { key },
    data: { count: record.count + 1 }
  });
  
  return true;
}

/** Extract client IP from a Next.js request */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Convenience: check rate limit and return a 429 Response if exceeded */
export async function checkRateLimit(
  request: Request,
  namespace: string,
  maxReqs: number,
  windowMs: number,
): Promise<Response | null> {
  const ip = getClientIp(request);
  const allowed = await rateLimit(`${ip}:${namespace}`, maxReqs, windowMs);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Trop de requêtes. Réessayez dans quelques instants.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(windowMs / 1000)),
        },
      },
    );
  }
  return null;
}
