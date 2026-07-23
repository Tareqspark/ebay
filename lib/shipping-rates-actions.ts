"use server";

import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { computeTotals, computeTotalsWithDiscount } from "@/lib/checkout";
import { validatePromoForCheckout } from "@/lib/promo";
import { getLoyaltyStatus } from "@/lib/loyalty";
import { getAvailableShippingRates, getShippingRateById } from "@/lib/shipping-rates";
import type { AvailableShippingRate } from "@/lib/shipping-rates";

export async function getShippingRatesAction(state: string, subtotal: number): Promise<AvailableShippingRate[]> {
  if (!state.trim()) return [];
  return getAvailableShippingRates(state, subtotal);
}

export interface ShippingTotalsPreview {
  error?: string;
  shipping?: number;
  tax?: number;
  total?: number;
  discount?: number;
}

/**
 * Read-only dry run for the "pick a shipping rate" step, mirroring
 * applyPromoCodeAction's relationship to the promo-code path — the
 * authoritative recompute still happens in createPaymentIntentAction right
 * before a charge is created, this is only for showing an accurate total
 * as the customer picks between rates.
 */
export async function previewShippingTotalsAction(shippingRateId: string, promoCode?: string): Promise<ShippingTotalsPreview> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to check out." };

  const cart = await getCart();
  if (cart.items.length === 0) return { error: "Your cart is empty." };

  const rate = await getShippingRateById(shippingRateId);
  const shippingOverride = rate?.rate;

  if (promoCode?.trim()) {
    const outcome = await validatePromoForCheckout(promoCode, session.user.id, cart.subtotal);
    if ("error" in outcome) return { error: outcome.error };
    const { shipping, tax, total, discount } = computeTotalsWithDiscount(
      cart.subtotal,
      { discountType: outcome.promo.discountType, discountPercent: outcome.promo.discountPercent, discountAmountCents: outcome.promo.discountAmountCents },
      shippingOverride
    );
    return { shipping, tax, total, discount };
  }

  const loyalty = await getLoyaltyStatus(session.user.id);
  if (loyalty.tier.discountPercent > 0) {
    const { shipping, tax, total, discount } = computeTotalsWithDiscount(
      cart.subtotal,
      { discountType: "percent", discountPercent: loyalty.tier.discountPercent, discountAmountCents: null },
      shippingOverride
    );
    return { shipping, tax, total, discount };
  }

  const { shipping, tax, total } = computeTotals(cart.subtotal, shippingOverride);
  return { shipping, tax, total, discount: 0 };
}
