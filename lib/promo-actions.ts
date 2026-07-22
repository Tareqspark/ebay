"use server";

import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { validatePromoForCheckout } from "@/lib/promo";

export interface ApplyPromoResult {
  error?: string;
  code?: string;
  discount?: number;
  shipping?: number;
  tax?: number;
  total?: number;
}

/** Dry-run preview only — doesn't record a redemption. The real, authoritative
 * check happens again in createPaymentIntentAction right before charging. */
export async function applyPromoCodeAction(rawCode: string): Promise<ApplyPromoResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to apply a promo code." };

  const cart = await getCart();
  if (cart.items.length === 0) return { error: "Your cart is empty." };

  const outcome = await validatePromoForCheckout(rawCode, session.user.id, cart.subtotal);
  if ("error" in outcome) return { error: outcome.error };

  return {
    code: outcome.result.code,
    discount: outcome.result.discount,
    shipping: outcome.result.shipping,
    tax: outcome.result.tax,
    total: outcome.result.total,
  };
}
