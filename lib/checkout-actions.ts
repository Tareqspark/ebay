"use server";

import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { computeTotals } from "@/lib/checkout";
import { validatePromoForCheckout } from "@/lib/promo";
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
  promoCode?: string
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

  // Re-validated here, independent of whatever the "Apply" preview showed —
  // this is the step that actually commits to a charge amount, so it can't
  // trust anything computed client-side or even a few seconds earlier.
  let total: number;
  let appliedPromoCode: string | undefined;
  if (promoCode?.trim()) {
    const outcome = await validatePromoForCheckout(promoCode, session.user.id, cart.subtotal);
    if ("error" in outcome) return { error: outcome.error };
    total = outcome.result.total;
    appliedPromoCode = outcome.result.code;
  } else {
    total = computeTotals(cart.subtotal).total;
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
    },
  });

  return { clientSecret: intent.client_secret ?? undefined, total };
}
