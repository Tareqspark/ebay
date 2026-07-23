import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { toDollars } from "@/lib/money";

/**
 * Spend-based tiers, ordered lowest to highest. Hardcoded rather than an
 * admin-configurable table — unlike promo codes (explicitly "admin will
 * generate" per-code discounts), this is the store's own standing loyalty
 * policy, closer to the tax rate/shipping threshold constants in
 * lib/checkout.ts than to a merchandising campaign.
 */
export interface LoyaltyTier {
  name: string;
  minLifetimeSpend: number;
  discountPercent: number;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { name: "Bronze", minLifetimeSpend: 0, discountPercent: 0 },
  { name: "Silver", minLifetimeSpend: 250, discountPercent: 3 },
  { name: "Gold", minLifetimeSpend: 750, discountPercent: 5 },
  { name: "Platinum", minLifetimeSpend: 2000, discountPercent: 8 },
];

export function getTierByName(name: string): LoyaltyTier | undefined {
  return LOYALTY_TIERS.find((t) => t.name === name);
}

function tierForSpend(lifetimeSpend: number): LoyaltyTier {
  let current = LOYALTY_TIERS[0];
  for (const tier of LOYALTY_TIERS) {
    if (lifetimeSpend >= tier.minLifetimeSpend) current = tier;
  }
  return current;
}

export interface LoyaltyStatus {
  tier: LoyaltyTier;
  lifetimeSpend: number;
  nextTier?: { name: string; remaining: number };
}

// Orders that were paid and stayed paid (or partially so) count toward
// lifetime spend — a fully refunded or never-paid order shouldn't buy tier
// progress.
const SPEND_COUNTING_STATUSES = ["paid", "partially_refunded"] as const;

export async function getLoyaltyStatus(userId: string): Promise<LoyaltyStatus> {
  const rows = await db
    .select({ totalCents: orders.totalCents })
    .from(orders)
    .where(and(eq(orders.userId, userId), inArray(orders.paymentStatus, SPEND_COUNTING_STATUSES)));

  const lifetimeSpend = toDollars(rows.reduce((sum, r) => sum + r.totalCents, 0));
  const tier = tierForSpend(lifetimeSpend);
  const tierIndex = LOYALTY_TIERS.indexOf(tier);
  const next = LOYALTY_TIERS[tierIndex + 1];

  return {
    tier,
    lifetimeSpend,
    nextTier: next ? { name: next.name, remaining: Math.max(0, next.minLifetimeSpend - lifetimeSpend) } : undefined,
  };
}
