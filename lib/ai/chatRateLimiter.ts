/**
 * In-memory rate limiter for the chat API.
 * Limits: 50 messages/hour per IP.
 * Resets automatically via TTL eviction.
 */

interface RateEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES = 50;

const store = new Map<string, RateEntry>();

// Clean expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 10 * 60 * 1000);
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + WINDOW_MS;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_MESSAGES - 1, resetAt };
  }

  if (entry.count >= MAX_MESSAGES) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_MESSAGES - entry.count, resetAt: entry.resetAt };
}
