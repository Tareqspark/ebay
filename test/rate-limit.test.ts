import { describe, it, expect, vi, afterEach } from "vitest";
import { isRateLimited, recordAttempt, getClientIp } from "@/lib/rate-limit";

// Each test uses a unique key (buckets is module-level shared state with no
// reset export) to avoid cross-test interference.
let counter = 0;
function uniqueKey(): string {
  counter += 1;
  return `test-key-${counter}`;
}

describe("isRateLimited / recordAttempt", () => {
  it("is not limited before any attempts are recorded", () => {
    expect(isRateLimited(uniqueKey(), 5, 60_000)).toBe(false);
  });

  it("does not itself count as an attempt", () => {
    const key = uniqueKey();
    isRateLimited(key, 1, 60_000);
    isRateLimited(key, 1, 60_000);
    expect(isRateLimited(key, 1, 60_000)).toBe(false);
  });

  it("becomes limited once maxAttempts recorded attempts land inside the window", () => {
    const key = uniqueKey();
    recordAttempt(key, 60_000);
    recordAttempt(key, 60_000);
    expect(isRateLimited(key, 2, 60_000)).toBe(true);
    // One fewer than what's recorded still isn't limited.
    expect(isRateLimited(key, 3, 60_000)).toBe(false);
  });

  it("stops counting attempts once they age out of the window", () => {
    vi.useFakeTimers();
    try {
      const key = uniqueKey();
      recordAttempt(key, 1_000);
      expect(isRateLimited(key, 1, 1_000)).toBe(true);
      vi.advanceTimersByTime(1_001);
      expect(isRateLimited(key, 1, 1_000)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});

describe("getClientIp", () => {
  it("prefers the first entry in x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.9" });
    expect(getClientIp(headers)).toBe("203.0.113.9");
  });

  it("falls back to 'unknown' when neither header is present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
