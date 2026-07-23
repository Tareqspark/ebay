import "server-only";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { promoCodes, promoRedemptions } from "@/db/schema";
import { computeTotalsWithDiscount } from "@/lib/checkout";
import { toCents, toDollars } from "@/lib/money";
import { formatPrice } from "@/lib/format";

export interface PromoValidationResult {
  code: string;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

/**
 * The one place that decides whether a promo code can be redeemed right
 * now, by this customer, against this subtotal — used both for the
 * checkout-page "Apply" preview and, authoritatively, right before the
 * PaymentIntent is created (see lib/checkout-actions.ts). Order creation
 * itself (lib/checkout.ts's createOrderFromPaymentIntent) does not call
 * this — by then payment already succeeded, so it just re-derives the
 * discount math from the code stored in the PaymentIntent's metadata.
 */
export async function validatePromoForCheckout(
  rawCode: string,
  userId: string,
  subtotal: number
): Promise<{ error: string } | { promo: typeof promoCodes.$inferSelect; result: PromoValidationResult }> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { error: "Enter a promo code" };

  const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
  if (!promo) return { error: "This promo code doesn't exist" };
  if (promo.status !== "active") return { error: "This promo code is no longer active" };

  const now = new Date();
  if (promo.startDate > now) return { error: "This promo code isn't active yet" };
  if (promo.endDate && promo.endDate < now) return { error: "This promo code has expired" };
  if (promo.usageLimit != null && promo.usageCount >= promo.usageLimit) {
    return { error: promo.usageLimit === 1 ? "This promo code has already been used" : "This promo code has reached its usage limit" };
  }

  const [alreadyUsed] = await db
    .select({ id: promoRedemptions.id })
    .from(promoRedemptions)
    .where(and(eq(promoRedemptions.promoCodeId, promo.id), eq(promoRedemptions.userId, userId)))
    .limit(1);
  if (alreadyUsed) return { error: "You've already used this promo code" };

  if (promo.minOrderAmountCents && toCents(subtotal) < promo.minOrderAmountCents) {
    return { error: `This code requires a minimum order of ${formatPrice(toDollars(promo.minOrderAmountCents))}` };
  }

  const { discount, shipping, tax, total } = computeTotalsWithDiscount(subtotal, promo);
  return { promo, result: { code: promo.code, discount, shipping, tax, total } };
}

/**
 * Atomically claims one usage slot — the WHERE clause re-checks the limit
 * in the same UPDATE that increments it, so two concurrent checkouts for
 * the same limited-use code can't both read usageCount as "under the
 * limit" and both succeed (validatePromoForCheckout's check alone can't
 * prevent this: two requests can both pass it before either has
 * incremented anything). Call this from createPaymentIntentAction, right
 * before creating the PaymentIntent — that's the actual money-committing
 * step, not order creation, which by then just describes what already
 * happened. affectedRows === 0 means someone else claimed the last slot
 * in between validation and this call.
 *
 * Trade-off: a slot claimed here is not released if the customer abandons
 * checkout before paying, same as a "held" ticket/seat — accepted rather
 * than building expiring reservations for this project's scale.
 */
export async function reservePromoUsage(promoId: string): Promise<boolean> {
  const [result] = await db
    .update(promoCodes)
    .set({ usageCount: sql`${promoCodes.usageCount} + 1` })
    .where(and(eq(promoCodes.id, promoId), or(isNull(promoCodes.usageLimit), lt(promoCodes.usageCount, promoCodes.usageLimit))));
  return result.affectedRows > 0;
}
