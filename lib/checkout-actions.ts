"use server";

import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { computeTotals, computeTotalsWithDiscount } from "@/lib/checkout";
import { getShippingRule } from "@/lib/shipping-thresholds";
import { validatePromoForCheckout, reservePromoUsage } from "@/lib/promo";
import { getLoyaltyStatus } from "@/lib/loyalty";
import { getShippingRateById } from "@/lib/shipping-rates";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { toCents } from "@/lib/money";
import { getAvailableStock } from "@/lib/inventory";

export interface ShippingAddressInput {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreatePaymentIntentResult {
  clientSecret?: string;
  total?: number;
  error?: string;
}

export async function createPaymentIntentAction(
  address: ShippingAddressInput,
  promoCode?: string,
  shippingRateId?: string
): Promise<CreatePaymentIntentResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to check out." };
  }

  if (!isStripeConfigured()) {
    return {
      error:
        "Payments aren't configured yet — add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local (Stripe Dashboard → Developers → API keys) and restart the dev server.",
    };
  }

  const cart = await getCart();
  if (cart.items.length === 0 || !cart.cartId) {
    return { error: "Your cart is empty." };
  }

  // Hard stock check — this is the actual money-committing step, same
  // reasoning as the promo-code usage reservation below. Cart-time capping
  // (lib/cart.ts) already keeps this from happening in the normal flow,
  // but stock can still shrink between then and now (another customer
  // buying the last units), so it's re-checked here rather than trusted.
  for (const item of cart.items) {
    const available = await getAvailableStock(item.product.id);
    if (available != null && item.quantity > available) {
      return {
        error:
          available === 0
            ? `${item.product.title} is out of stock — remove it from your cart to continue.`
            : `Only ${available} of "${item.product.title}" left — update the quantity in your cart to continue.`,
      };
    }
  }

  // Re-validated here, independent of whatever the client showed — this is
  // the step that actually commits to a charge amount. A chosen carrier
  // rate is re-looked-up by ID against THIS address's zone and THIS cart's
  // subtotal (never trusted as a raw dollar figure, and never accepted
  // just because the ID is active — it must still be the correct rate for
  // this specific destination/order value); falls back to the flat rate
  // if none was chosen or it no longer matches.
  let shippingOverride: number | undefined;
  let appliedShippingRateId: string | undefined;
  if (shippingRateId) {
    const rate = await getShippingRateById(shippingRateId, address.state, cart.subtotal, address.country);
    if (rate) {
      shippingOverride = rate.rate;
      appliedShippingRateId = rate.id;
    }
  }

  // A loyalty-tier discount and a promo code never stack — a promo code, if
  // present, always wins; the tier discount only kicks in when the
  // customer didn't enter one.
  let total: number;
  let appliedPromoCode: string | undefined;
  let appliedLoyaltyTier: string | undefined;
  // The destination's own free-shipping rule, not a site-wide constant —
  // this is the figure the customer is actually charged.
  const shippingRule = await getShippingRule(address.country);
  if (promoCode?.trim()) {
    const outcome = await validatePromoForCheckout(promoCode, session.user.id, cart.subtotal, address.country);
    if ("error" in outcome) return { error: outcome.error };
    // Claims the usage slot atomically right here, at the point a charge is
    // actually about to be created — validatePromoForCheckout's check alone
    // can't stop two concurrent checkouts both passing it before either
    // increments anything (see reservePromoUsage's doc comment).
    const reserved = await reservePromoUsage(outcome.promo.id);
    if (!reserved) {
      return {
        error:
          outcome.promo.usageLimit === 1
            ? "This promo code has already been used"
            : "This promo code just reached its usage limit",
      };
    }
    total = computeTotalsWithDiscount(
      cart.subtotal,
      { discountType: outcome.promo.discountType, discountPercent: outcome.promo.discountPercent, discountAmountCents: outcome.promo.discountAmountCents },
      shippingOverride,
      address.country,
      shippingRule
    ).total;
    appliedPromoCode = outcome.result.code;
  } else {
    const loyalty = await getLoyaltyStatus(session.user.id);
    if (loyalty.tier.discountPercent > 0) {
      total = computeTotalsWithDiscount(
        cart.subtotal,
        { discountType: "percent", discountPercent: loyalty.tier.discountPercent, discountAmountCents: null },
        shippingOverride,
        address.country,
        shippingRule
      ).total;
      appliedLoyaltyTier = loyalty.tier.name;
    } else {
      total = computeTotals(cart.subtotal, shippingOverride, address.country, shippingRule).total;
    }
  }

  const stripe = getStripe()!;

  const intent = await stripe.paymentIntents.create({
    amount: toCents(total),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      cartId: cart.cartId,
      userId: session.user.id,
      email: session.user.email ?? "",
      name: address.name,
      line1: address.line1,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      ...(appliedPromoCode ? { promoCode: appliedPromoCode } : {}),
      ...(appliedLoyaltyTier ? { loyaltyTier: appliedLoyaltyTier } : {}),
      ...(appliedShippingRateId ? { shippingRateId: appliedShippingRateId } : {}),
    },
  });

  return { clientSecret: intent.client_secret ?? undefined, total };
}
