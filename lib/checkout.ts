import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, cartItems, payments, promoCodes, promoRedemptions, users } from "@/db/schema";
import { newId } from "@/lib/id";
import { toCents, toDollars } from "@/lib/money";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { getProductsByIds } from "@/lib/products";
import { getProductMeta } from "@/lib/admin/data";
import { clearCartById } from "@/lib/cart";
import { orderConfirmationEmail } from "@/lib/email-templates";
import { decrementInventoryForProduct } from "@/lib/inventory";
import { logActivity } from "@/lib/admin/activity";
import { getTierByName } from "@/lib/loyalty";
import { computeBundleAdjustedSubtotal } from "@/lib/bundles";
import { resolveShippingSelection } from "@/lib/shipping-quote";
import { getShippingRule } from "@/lib/shipping-thresholds";
import { logError } from "@/lib/error-log";

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
    const rate = await resolveShippingSelection({
      id: shippingRateIdFromMetadata,
      state: address.state ?? "",
      zip: address.zip ?? "",
      country: address.country ?? "US",
      subtotal,
      cart: lineItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
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
  // Re-resolved here rather than carried in the intent metadata: the order
  // row must record what this destination's rule says now, and metadata is
  // client-visible.
  const { discount, shipping, tax, total } = computeTotalsWithDiscount(
    subtotal,
    discountSource,
    shippingOverride,
    address.country ?? "US",
    await getShippingRule(address.country ?? "US")
  );

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

  // The pre-flight check above narrows the window but cannot close it: the
  // Stripe webhook and the success page both call this for the same payment
  // and can pass that check concurrently. The unique index on
  // stripe_payment_intent_id is what actually decides, and whichever insert
  // loses returns the winner's order — so exactly one order is created, one
  // confirmation email sent, and inventory decremented once.
  try {
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
  } catch (err) {
    // Duplicate key means the concurrent caller already created this order.
    // Return theirs and stop here, so nothing downstream runs twice.
    const [winner] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1);
    if (winner) return winner.id;
    throw err;
  }

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
    /**
     * A failed confirmation email must never fail the order.
     *
     * This await was unguarded, and when the host began blocking outbound
     * SMTP the throw took the rest of this function with it: the order rows
     * were already written, but logActivity() below never ran and the
     * function never returned an order id. Three live orders (BS-251435,
     * BS-138548, BS-434640) exist with no entry in the activity feed as a
     * result. The payment has already succeeded by this point — nothing
     * after it should be able to unwind the sale.
     *
     * Logged through logError so it lands in Admin → Errors and alerts the
     * Owner, rather than only appearing in the server journal, which is how
     * this went unnoticed for five days.
     */
    try {
      await sendEmail({
        to: email,
        subject: `Your Cartebay order ${orderNumber} is confirmed`,
        html: orderConfirmationEmail({ orderNumber, items: lineItems, subtotal, shipping, tax, total, shippingAddress }),
      });
    } catch (err) {
      await logError(err, {
        source: "server-action",
        label: `Order ${orderNumber} confirmation email failed`,
      });
    }
  }

  await logActivity("order", `Order ${orderNumber} placed — $${total.toFixed(2)}`, "Storefront");

  return orderId;
}

/**
 * The customer's email lives on their user row, not the order — checkout
 * takes it from the Stripe metadata at the time and doesn't snapshot it.
 */
export async function getOrderCustomerEmail(orderId: string): Promise<string | null> {
  const [row] = await db
    .select({ email: users.email })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .where(eq(orders.id, orderId))
    .limit(1);
  return row?.email ?? null;
}

/**
 * Rebuilds the confirmation email from the stored order rather than the cart,
 * so a resend reproduces what was actually bought at the price actually paid,
 * even if the catalog has changed since. order_items already snapshots title
 * and price for exactly this reason.
 */
export async function buildOrderConfirmationHtml(orderId: string): Promise<string | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return orderConfirmationEmail({
    orderNumber: order.orderNumber,
    items: items.map((i) => ({
      title: i.title,
      image: i.image,
      quantity: i.quantity,
      price: toDollars(i.priceCents),
    })),
    subtotal: toDollars(order.subtotalCents),
    shipping: toDollars(order.shippingCents),
    tax: toDollars(order.taxCents),
    total: toDollars(order.totalCents),
    shippingAddress: order.shippingAddress,
  });
}
