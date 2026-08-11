"use client";

import { CheckCircle2, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/checkout-math";
import { formatPrice } from "@/lib/format";

/**
 * Live free-shipping progress in the top utility bar.
 *
 * The threshold comes from the same constant checkout charges against, so
 * the strip can't promise a figure the cart then contradicts. The remaining
 * amount is derived exactly as computeTotals() decides it — on `subtotal`,
 * before any promo or loyalty discount, which is the number the shipping
 * rule actually tests.
 */
// A whole-dollar threshold reads better without cents in the standing
// offer ("over $50"), while the amount still to spend needs them.
const THRESHOLD_LABEL = Number.isInteger(FREE_SHIPPING_THRESHOLD)
  ? `$${FREE_SHIPPING_THRESHOLD}`
  : formatPrice(FREE_SHIPPING_THRESHOLD);

export function FreeShippingStatus() {
  const { cart } = useCart();

  // The cart loads client-side after mount, so an empty subtotal means
  // either a genuinely empty cart or a cart still in flight. Both show the
  // plain offer, which is true in either case.
  if (cart.subtotal <= 0) {
    return (
      <span className="flex items-center gap-1.5">
        <Truck className="h-3.5 w-3.5 shrink-0" />
        Free shipping on orders over {THRESHOLD_LABEL}
      </span>
    );
  }

  if (cart.subtotal >= FREE_SHIPPING_THRESHOLD) {
    return (
      <span className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
        Your order ships free
      </span>
    );
  }

  const remaining = Math.round((FREE_SHIPPING_THRESHOLD - cart.subtotal) * 100) / 100;

  return (
    <span className="flex items-center gap-1.5">
      <Truck className="h-3.5 w-3.5 shrink-0" />
      You&apos;re {formatPrice(remaining)} away from free shipping
    </span>
  );
}
