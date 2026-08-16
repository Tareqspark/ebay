"use server";

import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { computeTotals, computeTotalsWithDiscount } from "@/lib/checkout";
import { getShippingRule } from "@/lib/shipping-thresholds";
import { validatePromoForCheckout } from "@/lib/promo";
import { getLoyaltyStatus } from "@/lib/loyalty";
import { getAvailableShippingRates } from "@/lib/shipping-rates";
import { quoteCartShipping, resolveShippingSelection } from "@/lib/shipping-quote";
import type { AvailableShippingRate } from "@/lib/shipping-rates";

/**
 * Live USPS quotes first, then the configured rate table.
 *
 * The two are offered together rather than one replacing the other: USPS can
 * only price the self-fulfilled part of a cart, and it can fail — no weight
 * recorded, an address it won't serve, or the hourly quota spent. The table
 * is what keeps checkout working in all of those cases, so it always stays
 * on the list.
 */
export interface ShippingRatesResult {
  rates: AvailableShippingRate[];
  /** True when the order leaves in two consignments — ours and CJ's. */
  splitShipment: boolean;
  /** CJ's dispatch fee, already included in every live rate above. */
  cjShippingCost: number;
}

export async function getShippingRatesAction(
  state: string,
  subtotal: number,
  country = "US",
  zip = ""
): Promise<ShippingRatesResult> {
  // Outside the US a state/province is optional — many countries have no
  // equivalent — so only the domestic path requires one before quoting.
  const isDomestic = country.trim().toUpperCase() === "US";
  const empty = { splitShipment: false, cjShippingCost: 0 };
  if (isDomestic && !state.trim()) return { rates: [], ...empty };

  const table = await getAvailableShippingRates(state, subtotal, country);

  // A US quote needs the ZIP; without one there is nothing to ask USPS.
  if (isDomestic && !zip.trim()) return { rates: table, ...empty };

  const cart = await getCart();
  if (cart.items.length === 0) return { rates: table, ...empty };

  const quote = await quoteCartShipping(
    cart.items.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
    { zip: zip.trim(), country }
  );

  const live: AvailableShippingRate[] = quote.options.map((o) => ({
    id: o.id,
    method: o.method,
    carrierName: o.carrierName,
    rate: o.rate,
    deliveryEstimate: o.deliveryEstimate,
  }));

  return {
    rates: [...live, ...table].sort((a, b) => a.rate - b.rate),
    splitShipment: quote.hasSelfItems && quote.hasCjItems,
    cjShippingCost: quote.cjShippingCost,
  };
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
export async function previewShippingTotalsAction(
  shippingRateId: string,
  state: string,
  promoCode?: string,
  country = "US",
  zip = ""
): Promise<ShippingTotalsPreview> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to check out." };

  const cart = await getCart();
  if (cart.items.length === 0) return { error: "Your cart is empty." };

  const rate = await resolveShippingSelection({
    id: shippingRateId,
    state,
    zip,
    country,
    subtotal: cart.subtotal,
    cart: cart.items.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
  });
  const shippingOverride = rate?.rate;
  // Must match what createPaymentIntentAction will charge for this
  // destination, or the summary and the card charge disagree.
  const shippingRule = await getShippingRule(country);

  if (promoCode?.trim()) {
    const outcome = await validatePromoForCheckout(promoCode, session.user.id, cart.subtotal, country);
    if ("error" in outcome) return { error: outcome.error };
    const { shipping, tax, total, discount } = computeTotalsWithDiscount(
      cart.subtotal,
      { discountType: outcome.promo.discountType, discountPercent: outcome.promo.discountPercent, discountAmountCents: outcome.promo.discountAmountCents },
      shippingOverride,
      country,
      shippingRule
    );
    return { shipping, tax, total, discount };
  }

  const loyalty = await getLoyaltyStatus(session.user.id);
  if (loyalty.tier.discountPercent > 0) {
    const { shipping, tax, total, discount } = computeTotalsWithDiscount(
      cart.subtotal,
      { discountType: "percent", discountPercent: loyalty.tier.discountPercent, discountAmountCents: null },
      shippingOverride,
      country,
      shippingRule
    );
    return { shipping, tax, total, discount };
  }

  const { shipping, tax, total } = computeTotals(cart.subtotal, shippingOverride, country, shippingRule);
  return { shipping, tax, total, discount: 0 };
}
