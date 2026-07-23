"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { returns, orders, orderItems } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { toDollars } from "@/lib/money";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { checkPlainText } from "@/lib/sanitize";
import { logError } from "@/lib/error-log";
import { requirePermission } from "@/lib/admin/permissions";

export interface ReturnActionResult {
  error?: string;
}

function revalidateReturnViews() {
  revalidatePath("/admin/returns");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
}

/**
 * Issues a real (partial) Stripe refund when the order has a stored
 * PaymentIntent and Stripe is configured — same graceful-degradation
 * pattern as refundOrderAction. Marks the order partially_refunded, unless
 * every line item on the order now has a refunded return, in which case
 * it's fully refunded — a real distinction, not cosmetic: lib/loyalty.ts's
 * lifetime-spend calculation treats "refunded" orders as $0 spend and
 * excludes them entirely, while "partially_refunded" nets out only the
 * actual refunded amount. Leaving every returned order stuck at
 * "partially_refunded" meant a customer who returned 100% of an order
 * still kept full loyalty credit for it forever.
 *
 * Completeness is measured by item count, not by comparing dollar
 * totals — refundAmountCents is already discount-proportioned (see
 * requestReturnAction), so summing it and comparing against the order's
 * raw, undiscounted subtotal would almost never reach "fully returned"
 * whenever any order-level discount applied, and per-item rounding on
 * that proportion could make it miss by a cent even without one. A
 * mixed self+CJ order can never register as fully returned this way
 * either, correctly — CJ items aren't returnable through this flow at
 * all (see requestReturnAction), so the order still has real value
 * outstanding until those are resolved through the CJ dispute flow.
 */
export async function approveReturnAction(returnId: string): Promise<ReturnActionResult> {
  const guard = await requirePermission("returns");
  if (guard) return guard;

  const [ret] = await db.select().from(returns).where(eq(returns.id, returnId)).limit(1);
  if (!ret) return { error: "Return not found" };
  if (ret.status !== "requested") return { error: "This return has already been processed" };

  const [order] = await db.select().from(orders).where(eq(orders.id, ret.orderId)).limit(1);
  if (!order) return { error: "Order not found" };

  const stripe = getStripe();
  if (stripe && order.stripePaymentIntentId) {
    try {
      await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId, amount: ret.refundAmountCents });
    } catch (err) {
      await logError(err, { source: "provider", label: "approveReturnAction" });
      return { error: "Stripe refund failed — return was not updated" };
    }
  }

  await db.update(returns).set({ status: "refunded" }).where(eq(returns.id, returnId));

  const [[{ totalItems }], [{ refundedItems }]] = await Promise.all([
    db.select({ totalItems: sql<string>`COUNT(*)` }).from(orderItems).where(eq(orderItems.orderId, ret.orderId)),
    db
      .select({ refundedItems: sql<string>`COUNT(*)` })
      .from(returns)
      .where(and(eq(returns.orderId, ret.orderId), eq(returns.status, "refunded"))),
  ]);
  const isFullyReturned = Number(refundedItems) >= Number(totalItems);

  await db
    .update(orders)
    .set({ paymentStatus: isFullyReturned ? "refunded" : "partially_refunded" })
    .where(eq(orders.id, ret.orderId));

  const actor = await getAdminActorName();
  await logActivity(
    "payment",
    `Return for "${ret.productTitle}" on order ${order.orderNumber} approved — ${toDollars(ret.refundAmountCents).toFixed(2)} refunded`,
    actor
  );
  revalidateReturnViews();
  return {};
}

export async function rejectReturnAction(returnId: string, adminNote = ""): Promise<ReturnActionResult> {
  const guard = await requirePermission("returns");
  if (guard) return guard;

  const trimmed = adminNote.trim();
  const textError = checkPlainText(trimmed, "Note");
  if (textError) return { error: textError };

  const [ret] = await db.select().from(returns).where(eq(returns.id, returnId)).limit(1);
  if (!ret) return { error: "Return not found" };
  if (ret.status !== "requested") return { error: "This return has already been processed" };

  await db.update(returns).set({ status: "rejected", adminNote: trimmed || null }).where(eq(returns.id, returnId));

  const actor = await getAdminActorName();
  await logActivity("order", `Return for "${ret.productTitle}" rejected`, actor);
  revalidateReturnViews();
  return {};
}
