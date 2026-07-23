import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, cartItems, payments, promoCodes, promoRedemptions } from "@/db/schema";
import { newId } from "@/lib/id";
import { toCents, toDollars } from "@/lib/money";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/sendgrid";
import { getProductsByIds } from "@/lib/products";
import { getProductMeta } from "@/lib/admin/data";
import { clearCartById } from "@/lib/cart";
import { orderConfirmationEmail } from "@/lib/email-templates";
import { decrementInventoryForProduct } from "@/lib/inventory";
import { logActivity } from "@/lib/admin/activity";
import { getTierByName } from "@/lib/loyalty";
import { computeBundleAdjustedSubtotal } from "@/lib/bundles";
import { getShippingRateById } from "@/lib/shipping-rates";

export const TAX_RATE = 0.0825;
export const FREE_SHIPPING_THRESHOLD = 50;
export const FLAT_SHIPPING = 6.99;

/**
 * shippingOverride, when given, replaces the flat/free-threshold shipping
 * figure with a real chosen shipping_rates rate (see lib/shipping-rates.ts)
 * — omitted, this is unchanged flat-rate behavior for every pre-existing
 * call site (cart page's free-shipping banner, etc).
 */
export function computeTotals(subtotal: number, shippingOverride?: number) {
  const shipping = shippingOverride ?? (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING);
  const tax = Math.round((subtotal + shipping) * TAX_RATE * 100) / 100;
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
export function computeTotalsWithDiscount(subtotal: number, promo?: PromoForDiscount | null, shippingOverride?: number) {
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

  const tax = Math.round((discountedSubtotal + shipping) * TAX_RATE * 100) / 100;
  const total = Math.round((discountedSubtotal + shipping + tax) * 100) / 100;
  return { discount, shipping, tax, total };
}

async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `BS-${Math.floor(100000 + Math.random() * 900000)}`;
    const [existing] = await db.select({ id: orders.id }).from(orders).where(eq(orders.orderNumber, candidate)).limit(1);
    if (!existing) return candidate;
  }
  return `BS-${Date.now()}`;
}

interface ShippingAddressInput {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * Idempotent: safe to call from both the Stripe webhook and the success-page
 * fallback (local dev often has no webhook forwarding configured) — the
 * unique index on stripePaymentIntentId means a second call is a no-op.
 */
export async function createOrderFromPaymentIntent(paymentIntentId: string): Promise<string | null> {
  const [existingOrder] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntentId))
    .limit(1);
  if (existingOrder) return existingOrder.id;

  const stripe = getStripe();
  if (!stripe) return null;

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") return null;

  const {
    cartId,
    userId,
    email,
    promoCode: promoCodeFromMetadata,
    loyaltyTier: loyaltyTierFromMetadata,
    shippingRateId: shippingRateIdFromMetadata,
    ...address
  } = intent.metadata as Record<string, string>;
  if (!cartId || !userId) return null;

  const rows = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  if (rows.length === 0) return null;

  const products = await getProductsByIds(rows.map((r) => r.productId));
  const productById = new Map(products.map((p) => [p.id, p]));

  const lineItems = (
    await Promise.all(
      rows.map(async (row) => {
        const product = productById.get(row.productId);
        if (!product) return null;
        const meta = await getProductMeta(product.id);
        return {
          productId: product.id,
          title: product.title,
          image: product.images[0],
          quantity: row.quantity,
          price: product.price,
          source: meta?.source ?? ("self" as const),
        };
      }),
    )
  ).filter((x): x is NonNullable<typeof x> => x !== null);

  const { subtotal, bundleDiscount } = await computeBundleAdjustedSubtotal(
    lineItems.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price }))
  );

  let shippingMethod: string | null = null;
  let shippingOverride: number | undefined;
  if (shippingRateIdFromMetadata) {
    const rate = await getShippingRateById(shippingRateIdFromMetadata);
    if (rate) {
      shippingOverride = rate.rate;
      shippingMethod = rate.carrierName ? `${rate.carrierName} — ${rate.method}` : rate.method;
    }
  }

  let promoRow: typeof promoCodes.$inferSelect | null = null;
  let loyaltyTier: string | null = null;
  let discountSource: PromoForDiscount | null = null;
  if (promoCodeFromMetadata) {
    const [row] = await db.select().from(promoCodes).where(eq(promoCodes.code, promoCodeFromMetadata)).limit(1);
    promoRow = row ?? null;
    discountSource = promoRow;
  } else if (loyaltyTierFromMetadata) {
    const tier = getTierByName(loyaltyTierFromMetadata);
    if (tier) {
      loyaltyTier = tier.name;
      discountSource = { discountType: "percent", discountPercent: tier.discountPercent, discountAmountCents: null };
    }
  }
  const { discount, shipping, tax, total } = computeTotalsWithDiscount(subtotal, discountSource, shippingOverride);

  const shippingAddress: ShippingAddressInput = {
    name: address.name ?? "",
    line1: address.line1 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    zip: address.zip ?? "",
    country: address.country ?? "US",
  };

  const orderId = newId();
  const orderNumber = await generateOrderNumber();

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    userId,
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    subtotalCents: toCents(subtotal),
    shippingCents: toCents(shipping),
    taxCents: toCents(tax),
    totalCents: toCents(total),
    promoCode: promoRow?.code ?? null,
    loyaltyTier,
    bundleDiscountCents: toCents(bundleDiscount),
    shippingMethod,
    discountCents: toCents(discount),
    paymentMethod: "card",
    stripePaymentIntentId: paymentIntentId,
    shippingAddress,
  });

  await db.insert(orderItems).values(
    lineItems.map((item) => ({
      id: newId(),
      orderId,
      productId: item.productId,
      title: item.title,
      image: item.image,
      quantity: item.quantity,
      priceCents: toCents(item.price),
      source: item.source,
    }))
  );

  await db.insert(payments).values({
    id: newId(),
    orderId,
    customerId: userId,
    amountCents: toCents(total),
    status: "succeeded",
    method: "card",
  });

  if (promoRow) {
    await db.insert(promoRedemptions).values({
      id: newId(),
      promoCodeId: promoRow.id,
      code: promoRow.code,
      userId,
      orderId,
      discountCents: toCents(discount),
    });
    await db.update(promoCodes).set({ usageCount: sql`${promoCodes.usageCount} + 1` }).where(eq(promoCodes.id, promoRow.id));
  }

  await clearCartById(cartId);

  // Only self-fulfilled items hold real Baruashop-owned stock — CJ-sourced
  // items are dropshipped and CJ holds that inventory, not us.
  await Promise.all(
    lineItems
      .filter((item) => item.source === "self")
      .map((item) => decrementInventoryForProduct(item.productId, item.quantity))
  );

  if (email) {
    await sendEmail({
      to: email,
      subject: `Your Baruashop order ${orderNumber} is confirmed`,
      html: orderConfirmationEmail({ orderNumber, items: lineItems, subtotal, shipping, tax, total, shippingAddress }),
    });
  }

  await logActivity("order", `Order ${orderNumber} placed — $${total.toFixed(2)}`, "Storefront");

  return orderId;
}
