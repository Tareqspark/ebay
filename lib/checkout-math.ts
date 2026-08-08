import type { promoCodes } from "@/db/schema";
import { toDollars } from "@/lib/money";

// Pure checkout arithmetic — no DB, no "server-only" — split out of
// lib/checkout.ts (which pulls in Stripe/SendGrid/product-meta/activity
// logging and is unsafe to import in isolation) so this specific math,
// including the shipping-threshold and order-discount logic that was
// previously exploitable, can be unit-tested directly.

export const TAX_RATE = 0.0825;
export const FREE_SHIPPING_THRESHOLD = 50;
export const FLAT_SHIPPING = 6.99;

/**
 * shippingOverride, when given, replaces the flat/free-threshold shipping
 * figure with a real chosen shipping_rates rate (see lib/shipping-rates.ts)
 * — omitted, this is unchanged flat-rate behavior for every pre-existing
 * call site (cart page's free-shipping banner, etc).
 */
/**
 * US sales tax does not apply to goods exported abroad, and charging it to
 * an overseas customer would be billing them for a liability that does not
 * exist. International buyers instead pay their own country's import duty
 * and VAT on arrival, collected by the carrier — not by us at checkout.
 */
export function isTaxable(country = "US"): boolean {
  return country.trim().toUpperCase() === "US";
}

export function computeTotals(subtotal: number, shippingOverride?: number, country = "US") {
  const shipping = shippingOverride ?? (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING);
  const tax = isTaxable(country) ? Math.round((subtotal + shipping) * TAX_RATE * 100) / 100 : 0;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { shipping, tax, total };
}

export type PromoDiscountType = (typeof promoCodes.$inferSelect)["discountType"];

export interface PromoForDiscount {
  discountType: PromoDiscountType;
  discountPercent: number | null;
  discountAmountCents: number | null;
}

/**
 * Same shape as computeTotals(), plus a discount amount — kept as a
 * separate function (rather than an optional param on computeTotals) so
 * every existing no-promo call site stays untouched. shippingOverride
 * behaves the same as on computeTotals() — when a customer picked a real
 * carrier rate, a free_shipping promo waives *that* rate, not the flat one.
 */
export function computeTotalsWithDiscount(
  subtotal: number,
  promo?: PromoForDiscount | null,
  shippingOverride?: number,
  country = "US"
) {
  const baseShipping = shippingOverride ?? (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING);

  let discount = 0;
  let shipping = baseShipping;
  let discountedSubtotal = subtotal;

  if (promo?.discountType === "percent" && promo.discountPercent) {
    discount = Math.min(subtotal, Math.round(subtotal * (promo.discountPercent / 100) * 100) / 100);
    discountedSubtotal = Math.round((subtotal - discount) * 100) / 100;
  } else if (promo?.discountType === "fixed" && promo.discountAmountCents) {
    discount = Math.min(subtotal, toDollars(promo.discountAmountCents));
    discountedSubtotal = Math.round((subtotal - discount) * 100) / 100;
  } else if (promo?.discountType === "free_shipping") {
    // Waives the shipping fee only — the product subtotal is untouched.
    discount = baseShipping;
    shipping = 0;
  }

  const tax = isTaxable(country) ? Math.round((discountedSubtotal + shipping) * TAX_RATE * 100) / 100 : 0;
  const total = Math.round((discountedSubtotal + shipping + tax) * 100) / 100;
  return { discount, shipping, tax, total };
}
