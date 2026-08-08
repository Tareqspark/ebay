"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { generateTrackingNumber } from "@/lib/shipping-provider";
import { pushOrderToCj } from "@/lib/cj-provider";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { logError } from "@/lib/error-log";
import { requirePermission, requireOwner } from "@/lib/admin/permissions";
import { recordOrderEvent } from "@/lib/admin/order-events";
import { checkPlainText } from "@/lib/sanitize";
import { sendEmail } from "@/lib/email";
import { getOrderCustomerEmail, buildOrderConfirmationHtml } from "@/lib/checkout";

function revalidateOrderViews() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/cj/orders");
  revalidatePath("/admin");
}

export interface OrderActionResult {
  error?: string;
}

export async function markOrderShippedAction(orderId: string, orderNumber: string): Promise<OrderActionResult> {
  const guard = await requirePermission("orders");
  if (guard) return guard;

  const [order] = await db.select({ shippingMethod: orders.shippingMethod }).from(orders).where(eq(orders.id, orderId)).limit(1);
  // shippingMethod is a "Carrier — Method" snapshot from the rate chosen at
  // checkout (lib/shipping-rates.ts); fall back to UPS for orders placed
  // before that existed or where no rate matched (e.g. CJ-only orders).
  const carrier = order?.shippingMethod?.split(" — ")[0] || "UPS";
  const trackingNumber = generateTrackingNumber(carrier);
  await db
    .update(orders)
    .set({ fulfillmentStatus: "shipped", trackingNumber, carrier })
    .where(eq(orders.id, orderId));

  const actor = await getAdminActorName();
  await recordOrderEvent(orderId, "fulfillment", `Marked as shipped via ${carrier} — tracking ${trackingNumber}`, actor);
  await logActivity("order", `Order ${orderNumber} marked as shipped (${carrier} ${trackingNumber})`, actor);
  revalidateOrderViews();
  return {};
}

export async function cancelOrderAction(orderId: string, orderNumber: string): Promise<OrderActionResult> {
  const guard = await requirePermission("orders");
  if (guard) return guard;

  await db.update(orders).set({ fulfillmentStatus: "cancelled" }).where(eq(orders.id, orderId));

  const actor = await getAdminActorName();
  await recordOrderEvent(orderId, "status", "Order cancelled", actor);
  await logActivity("order", `Order ${orderNumber} cancelled`, actor);
  revalidateOrderViews();
  return {};
}

/**
 * Issues a real Stripe refund when the order has a stored PaymentIntent and
 * Stripe is configured (degrades gracefully — same pattern as checkout —
 * when STRIPE_SECRET_KEY is unset, so this still works in local dev without
 * live keys). Always updates the DB regardless, since the order's
 * paymentStatus needs to reflect the refund either way.
 */
export async function refundOrderAction(orderId: string, orderNumber: string): Promise<OrderActionResult> {
  // Owner-only, not a governable permission: this moves real money out
  // through Stripe for an arbitrary order and amount. It previously shared
  // the "orders" permission with viewing and shipping, which meant anyone
  // who could open an order could refund it. Approving a *return* still runs
  // on the "returns" permission — that refund is bounded by an actual
  // returned item, so it stays part of normal support work.
  const guard = await requireOwner();
  if (guard) return guard;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { error: "Order not found" };

  const stripe = getStripe();
  if (stripe && order.stripePaymentIntentId) {
    try {
      await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
    } catch (err) {
      await logError(err, { source: "provider", label: "refundOrderAction" });
      return { error: "Stripe refund failed — order was not updated" };
    }
  }

  await db.update(orders).set({ paymentStatus: "refunded" }).where(eq(orders.id, orderId));
  await db.update(payments).set({ status: "refunded" }).where(eq(payments.orderId, orderId));

  const actor = await getAdminActorName();
  await recordOrderEvent(orderId, "payment", "Full refund issued to the original payment method", actor);
  await logActivity("payment", `Order ${orderNumber} refunded`, actor);
  revalidateOrderViews();
  revalidatePath("/admin/payments");
  return {};
}

/**
 * Routed through lib/cj-provider.ts's pushOrderToCj(), which calls the real
 * CJdropshipping order-creation API when CJ_API_KEY is configured (as it is
 * in both dev and production) — this places a real wholesale order and
 * draws from the real CJ account balance, it is not a mock. Falls back to
 * a local-only mock id only when CJ_API_KEY is unset.
 */
export async function pushOrderToCjAction(orderId: string, orderNumber: string): Promise<OrderActionResult> {
  const guard = await requirePermission("orders");
  if (guard) return guard;

  const { cjOrderId } = await pushOrderToCj(orderId);
  await db.update(orders).set({ cjSyncStatus: "queued", cjOrderId }).where(eq(orders.id, orderId));

  const actor = await getAdminActorName();
  await recordOrderEvent(orderId, "fulfillment", `Pushed to CJdropshipping — supplier order ${cjOrderId}`, actor);
  await logActivity("order", `Order ${orderNumber} pushed to CJdropshipping (${cjOrderId})`, actor);
  revalidateOrderViews();
  return {};
}

export interface OrderAddress {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/** Free-text note pinned to the order's timeline — "customer called, agreed to X". */
export async function addOrderNoteAction(orderId: string, note: string): Promise<OrderActionResult> {
  const guard = await requirePermission("orders");
  if (guard) return guard;

  const text = note.trim();
  if (!text) return { error: "Note can't be empty" };
  const textError = checkPlainText(text, "Note");
  if (textError) return { error: textError };

  const actor = await getAdminActorName();
  await recordOrderEvent(orderId, "note", text, actor);
  revalidateOrderViews();
  return {};
}

/**
 * Corrects the delivery address, which until now was fixed at checkout — a
 * mistyped street or zip meant cancelling and re-placing the order. Blocked
 * once the parcel is moving, since changing it then would misrepresent where
 * the goods actually went; the old value is written into the timeline so the
 * change is never silent.
 */
export async function updateOrderAddressAction(orderId: string, address: OrderAddress): Promise<OrderActionResult> {
  const guard = await requirePermission("orders");
  if (guard) return guard;

  for (const [field, value] of Object.entries(address)) {
    if (!value.trim()) return { error: `${field} is required` };
    const textError = checkPlainText(value, field);
    if (textError) return { error: textError };
  }

  const [order] = await db
    .select({ fulfillmentStatus: orders.fulfillmentStatus, shippingAddress: orders.shippingAddress })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return { error: "Order not found" };
  if (["shipped", "delivered"].includes(order.fulfillmentStatus)) {
    return { error: "This order has already shipped — the address can no longer be changed" };
  }

  await db.update(orders).set({ shippingAddress: address }).where(eq(orders.id, orderId));

  const previous = order.shippingAddress;
  const actor = await getAdminActorName();
  await recordOrderEvent(
    orderId,
    "status",
    `Shipping address changed from "${previous.line1}, ${previous.city} ${previous.zip}" to "${address.line1}, ${address.city} ${address.zip}"`,
    actor
  );
  revalidateOrderViews();
  return {};
}

/** Re-sends the original confirmation, for the common case of it being deleted or filtered as spam. */
export async function resendOrderConfirmationAction(orderId: string, orderNumber: string): Promise<OrderActionResult> {
  const guard = await requirePermission("orders");
  if (guard) return guard;

  const email = await getOrderCustomerEmail(orderId);
  if (!email) return { error: "This order has no customer email on file" };

  const html = await buildOrderConfirmationHtml(orderId);
  if (!html) return { error: "Couldn't rebuild this order's confirmation" };

  await sendEmail({ to: email, subject: `Your Cartebay order ${orderNumber} is confirmed`, html });

  const actor = await getAdminActorName();
  await recordOrderEvent(orderId, "email", `Order confirmation re-sent to ${email}`, actor);
  revalidateOrderViews();
  return {};
}
