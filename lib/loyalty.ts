import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, returns } from "@/db/schema";
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
// progress. "partially_refunded" still nets out whatever was actually
// returned (below) rather than counting the order's full original total —
// otherwise a partial return wouldn't reduce lifetime spend at all, and a
// customer could buy big, return most of it, and keep the tier credit for
// value they got back.
const SPEND_COUNTING_STATUSES = ["paid", "partially_refunded"] as const;

export async function getLoyaltyStatus(userId: string): Promise<LoyaltyStatus> {
  const orderRows = await db
    .select({ id: orders.id, totalCents: orders.totalCents })
    .from(orders)
    .where(and(eq(orders.userId, userId), inArray(orders.paymentStatus, SPEND_COUNTING_STATUSES)));

  const orderIds = orderRows.map((o) => o.id);
  const refundedByOrder = new Map<string, number>();
  if (orderIds.length > 0) {
    const refundRows = await db
      .select({ orderId: returns.orderId, refundAmountCents: returns.refundAmountCents })
      .from(returns)
      .where(and(inArray(returns.orderId, orderIds), eq(returns.status, "refunded")));
    for (const r of refundRows) {
      refundedByOrder.set(r.orderId, (refundedByOrder.get(r.orderId) ?? 0) + r.refundAmountCents);
    }
  }

  const lifetimeSpendCents = orderRows.reduce(
    (sum, o) => sum + Math.max(0, o.totalCents - (refundedByOrder.get(o.id) ?? 0)),
    0
  );
  const lifetimeSpend = toDollars(lifetimeSpendCents);
  const tier = tierForSpend(lifetimeSpend);
  const tierIndex = LOYALTY_TIERS.indexOf(tier);
  const next = LOYALTY_TIERS[tierIndex + 1];

  return {
    tier,
    lifetimeSpend,
    nextTier: next ? { name: next.name, remaining: Math.max(0, next.minLifetimeSpend - lifetimeSpend) } : undefined,
  };
}
