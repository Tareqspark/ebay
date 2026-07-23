/**
 * In-memory sliding-window rate limiting — shared by the contact form and
 * login brute-force protection. Resets on deploy/restart, which is an
 * accepted tradeoff at this project's scale (same reasoning as the
 * contact form's original rate limiter, now generalized here rather than
 * duplicated per call site).
 */
const buckets = new Map<string, number[]>();

/** True if `key` has already hit `maxAttempts` within `windowMs` — does not itself record an attempt. */
export function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  buckets.set(key, recent);
  return recent.length >= maxAttempts;
}

/** Records one attempt against `key`, pruning anything outside the window. Call after a check that should count — e.g. a failed login, not a successful one. */
export function recordAttempt(key: string, windowMs: number): void {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
}

export function getClientIp(headerSource: Headers): string {
  return headerSource.get("x-forwarded-for")?.split(",")[0]?.trim() || headerSource.get("x-real-ip") || "unknown";
}
