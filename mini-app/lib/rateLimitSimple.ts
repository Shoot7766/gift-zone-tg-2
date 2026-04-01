type Bucket = { n: number; reset: number };

const store = new Map<string, Bucket>();

/**
 * Oddiy o‘yinchoq rate limit (serverless da instansiya bo‘yicha). AI xarajatini cheklash uchun.
 */
export function rateLimitAllow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = store.get(key);
  if (!b || now > b.reset) {
    store.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (b.n >= max) return false;
  b.n += 1;
  return true;
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
