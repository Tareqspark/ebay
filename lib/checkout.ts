import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, cartItems, payments, promoCodes, promoRedemptions } from "@/db/schema";
import { newId } from "@/lib/id";
import { toCents } from "@/lib/money";
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

// The pure arithmetic (computeTotals, computeTotalsWithDiscount, the
// TAX_RATE/FREE_SHIPPING_THRESHOLD/FLAT_SHIPPING constants) lives in
// lib/checkout-math.ts, which has no DB/Stripe/SendGrid imports and is
// unit-tested directly — re-exported here so every existing call site
// (`from "@/lib/checkout"`) is unaffected.
export * from "@/lib/checkout-math";
import type { PromoForDiscount } from "@/lib/checkout-math";
import { computeTotalsWithDiscount } from "@/lib/checkout-math";

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
    const rate = await getShippingRateById(shippingRateIdFromMetadata, address.state ?? "", subtotal);
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
    // Without this, cj_sync_status stays NULL — the admin CJ Orders page's
    // "Push to CJ" button (both per-row and bulk) checks
    // `cjSyncStatus === "not_sent"` by strict equality, which NULL never
    // satisfies, so the button silently does nothing for every order this
    // creates (verified live: a real order's checkbox showed selected but
    // the bulk push button had nothing to act on).
    cjSyncStatus: lineItems.some((item) => item.source === "cj") ? "not_sent" : null,
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
    // The usage slot was already atomically claimed in
    // createPaymentIntentAction (lib/promo.ts's reservePromoUsage) — by now
    // payment has succeeded, so this only records who redeemed it, not
    // whether they were allowed to.
    await db.insert(promoRedemptions).values({
      id: newId(),
      promoCodeId: promoRow.id,
      code: promoRow.code,
      userId,
      orderId,
      discountCents: toCents(discount),
    });
  }

  await clearCartById(cartId);

  // Only self-fulfilled items hold real Cartebay-owned stock — CJ-sourced
  // items are dropshipped and CJ holds that inventory, not us.
  await Promise.all(
    lineItems
      .filter((item) => item.source === "self")
      .map((item) => decrementInventoryForProduct(item.productId, item.quantity))
  );

  if (email) {
    await sendEmail({
      to: email,
      subject: `Your Cartebay order ${orderNumber} is confirmed`,
      html: orderConfirmationEmail({ orderNumber, items: lineItems, subtotal, shipping, tax, total, shippingAddress }),
    });
  }

  await logActivity("order", `Order ${orderNumber} placed — $${total.toFixed(2)}`, "Storefront");

  return orderId;
}
