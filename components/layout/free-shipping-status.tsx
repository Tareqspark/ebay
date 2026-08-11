"use client";

import { CheckCircle2, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { amountToFreeShipping, type ShippingRule } from "@/lib/checkout-math";
import { formatPrice } from "@/lib/format";

/**
 * Live free-shipping progress in the top utility bar.
 *
 * The rule is resolved server-side for the shopper's chosen ship-to country
 * and passed in, so the strip promises whatever *that* destination actually
 * gets — a country with free shipping switched off is told so rather than
 * being shown a threshold it can never reach.
 *
 * It's the same rule object checkout charges against, so the strip can't
 * advertise a figure the cart then contradicts.
 */

// Whole-dollar thresholds read better without cents in the standing offer
// ("over $50"), while the amount still to spend needs them.
function amount(value: number): string {
  return Number.isInteger(value) ? `$${value}` : formatPrice(value);
}

export function FreeShippingStatus({ rule, countryName }: { rule: ShippingRule; countryName: string }) {
  const { cart } = useCart();

  if (!rule.freeShippingEnabled) {
    return (
      <span className="flex items-center gap-1.5">
        <Truck className="h-3.5 w-3.5 shrink-0" />
        Shipping to {countryName} from {amount(rule.flatRate)}
      </span>
    );
  }

  // The cart loads client-side after mount, so an empty subtotal means
  // either a genuinely empty cart or one still in flight. Both show the
  // plain offer, which is true in either case.
  if (cart.subtotal <= 0) {
    return (
      <span className="flex items-center gap-1.5">
        <Truck className="h-3.5 w-3.5 shrink-0" />
        Free shipping on orders over {amount(rule.threshold)}
      </span>
    );
  }

  const remaining = amountToFreeShipping(cart.subtotal, rule);
  if (remaining === 0) {
    return (
      <span className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
        Your order ships free
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <Truck className="h-3.5 w-3.5 shrink-0" />
      You&apos;re {formatPrice(remaining!)} away from free shipping
    </span>
  );
}
