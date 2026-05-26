// lib/rateLimit.ts — In-memory rate limiter for API routes
// Uses a Map to track requests per key within a sliding window.
// Note: resets on each serverless cold start — use Upstash Redis for persistent limits.

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired entries periodically to prevent memory leaks
let lastCleanup = Date.now();
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return; // Only clean every 60s
  lastCleanup = now;
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) rateLimitMap.delete(key);
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key       Unique key (e.g. `ip:${ip}:reviews`)
 * @param maxReqs   Maximum requests allowed in the window
 * @param windowMs  Window size in milliseconds
 */
export function rateLimit(key: string, maxReqs: number, windowMs: number): boolean {
  maybeCleanup();
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxReqs) return false;
  record.count++;
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
export function checkRateLimit(
  request: Request,
  namespace: string,
  maxReqs: number,
  windowMs: number,
): Response | null {
  const ip = getClientIp(request);
  const allowed = rateLimit(`${ip}:${namespace}`, maxReqs, windowMs);
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
