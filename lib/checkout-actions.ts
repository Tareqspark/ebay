"use server";

import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { computeTotals, computeTotalsWithDiscount } from "@/lib/checkout";
import { validatePromoForCheckout } from "@/lib/promo";
import { getLoyaltyStatus } from "@/lib/loyalty";
import { getShippingRateById } from "@/lib/shipping-rates";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { toCents } from "@/lib/money";

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

  // Re-validated here, independent of whatever the client showed — this is
  // the step that actually commits to a charge amount. A chosen carrier
  // rate is re-looked-up by ID (never trusted as a raw dollar figure);
  // falls back to the flat rate if none was chosen or it's no longer valid.
  let shippingOverride: number | undefined;
  let appliedShippingRateId: string | undefined;
  if (shippingRateId) {
    const rate = await getShippingRateById(shippingRateId);
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
  if (promoCode?.trim()) {
    const outcome = await validatePromoForCheckout(promoCode, session.user.id, cart.subtotal);
    if ("error" in outcome) return { error: outcome.error };
    total = computeTotalsWithDiscount(
      cart.subtotal,
      { discountType: outcome.promo.discountType, discountPercent: outcome.promo.discountPercent, discountAmountCents: outcome.promo.discountAmountCents },
      shippingOverride
    ).total;
    appliedPromoCode = outcome.result.code;
  } else {
    const loyalty = await getLoyaltyStatus(session.user.id);
    if (loyalty.tier.discountPercent > 0) {
      total = computeTotalsWithDiscount(
        cart.subtotal,
        { discountType: "percent", discountPercent: loyalty.tier.discountPercent, discountAmountCents: null },
        shippingOverride
      ).total;
      appliedLoyaltyTier = loyalty.tier.name;
    } else {
      total = computeTotals(cart.subtotal, shippingOverride).total;
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
