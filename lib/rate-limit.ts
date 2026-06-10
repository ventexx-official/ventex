/**
 * In-memory LRU rate limiter for Next.js API routes.
 * Limits each IP to a maximum number of requests per time window.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000;

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * @param req - The incoming request
 * @param limit - Max requests allowed in the window (default: 10)
 * @param windowMs - Time window in ms (default: 60 000 = 1 minute)
 * @returns { success: boolean, remaining: number, resetAt: number }
 */
export function rateLimit(
  req: Request,
  limit = 10,
  windowMs = 60_000
): { success: boolean; remaining: number; resetAt: number } {
  const ip = getClientIp(req);
  const now = Date.now();

  // Evict oldest entries if store is too large
  if (store.size >= MAX_STORE_SIZE) {
    const oldest = [...store.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)[0];
    if (oldest) store.delete(oldest[0]);
  }

  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    store.set(ip, newEntry);
    return { success: true, remaining: limit - 1, resetAt: newEntry.resetAt };
  }

  entry.count++;
  store.set(ip, entry);

  const remaining = Math.max(0, limit - entry.count);
  return { success: entry.count <= limit, remaining, resetAt: entry.resetAt };
}
