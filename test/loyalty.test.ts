import { describe, it, expect } from "vitest";
import { tierForSpend, getTierByName, LOYALTY_TIERS } from "@/lib/loyalty";

describe("tierForSpend", () => {
  it("starts everyone at Bronze", () => {
    expect(tierForSpend(0).name).toBe("Bronze");
    expect(tierForSpend(249.99).name).toBe("Bronze");
  });

  it("promotes exactly at each tier's threshold, not one cent short", () => {
    expect(tierForSpend(250).name).toBe("Silver");
    expect(tierForSpend(249).name).toBe("Bronze");

    expect(tierForSpend(750).name).toBe("Gold");
    expect(tierForSpend(749).name).toBe("Silver");

    expect(tierForSpend(2000).name).toBe("Platinum");
    expect(tierForSpend(1999).name).toBe("Gold");
  });

  it("never exceeds the top tier no matter how high spend goes", () => {
    expect(tierForSpend(1_000_000).name).toBe("Platinum");
  });

  it("every tier's discount is non-decreasing as spend goes up (no accidental downgrade)", () => {
    const sorted = [...LOYALTY_TIERS].sort((a, b) => a.minLifetimeSpend - b.minLifetimeSpend);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].discountPercent).toBeGreaterThanOrEqual(sorted[i - 1].discountPercent);
    }
  });
});

describe("getTierByName", () => {
  it("finds a real tier by name", () => {
    expect(getTierByName("Gold")?.discountPercent).toBe(5);
  });

  it("returns undefined for an unknown name", () => {
    expect(getTierByName("Diamond")).toBeUndefined();
  });
});
