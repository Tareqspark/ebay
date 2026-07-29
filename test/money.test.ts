import { describe, it, expect } from "vitest";
import { toCents, toDollars } from "@/lib/money";

describe("toCents", () => {
  it("converts a whole-dollar amount", () => {
    expect(toCents(19)).toBe(1900);
  });

  it("converts a fractional amount without floating-point drift", () => {
    // 19.99 * 100 is 1998.9999999999998 in raw JS float math — the whole
    // point of toCents is to round that back to the correct integer.
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.1)).toBe(10);
    expect(toCents(6.99)).toBe(699);
  });

  it("rounds to the nearest cent rather than truncating", () => {
    expect(toCents(1.006)).toBe(101);
    expect(toCents(1.004)).toBe(100);
  });

  it("handles zero", () => {
    expect(toCents(0)).toBe(0);
  });
});

describe("toDollars", () => {
  it("converts cents back to a dollar amount", () => {
    expect(toDollars(1999)).toBe(19.99);
    expect(toDollars(100)).toBe(1);
    expect(toDollars(0)).toBe(0);
  });

  it("round-trips with toCents for typical prices", () => {
    for (const dollars of [0, 0.5, 6.99, 19.99, 49.99, 249.5, 1999.99]) {
      expect(toDollars(toCents(dollars))).toBe(dollars);
    }
  });
});
