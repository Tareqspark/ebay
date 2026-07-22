import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { promoCodes, promoRedemptions } from "@/db/schema";
import { computeTotalsWithDiscount } from "@/lib/checkout";

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
  if (promo.singleUse && promo.usageCount > 0) return { error: "This promo code has already been used" };

  const [alreadyUsed] = await db
    .select({ id: promoRedemptions.id })
    .from(promoRedemptions)
    .where(and(eq(promoRedemptions.promoCodeId, promo.id), eq(promoRedemptions.userId, userId)))
    .limit(1);
  if (alreadyUsed) return { error: "You've already used this promo code" };

  const { discount, shipping, tax, total } = computeTotalsWithDiscount(subtotal, promo);
  return { promo, result: { code: promo.code, discount, shipping, tax, total } };
}
