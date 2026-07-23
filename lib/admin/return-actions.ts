"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { returns, orders } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { toDollars } from "@/lib/money";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { checkPlainText } from "@/lib/sanitize";

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
 * pattern as refundOrderAction. Marks the order partially_refunded rather
 * than refunded, since a return covers one line item, not necessarily
 * the whole order.
 */
export async function approveReturnAction(returnId: string): Promise<ReturnActionResult> {
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
      console.error("[approveReturnAction] Stripe refund failed", err);
      return { error: "Stripe refund failed — return was not updated" };
    }
  }

  await db.update(returns).set({ status: "refunded" }).where(eq(returns.id, returnId));
  await db.update(orders).set({ paymentStatus: "partially_refunded" }).where(eq(orders.id, ret.orderId));

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
