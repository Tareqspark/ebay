"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, returns } from "@/db/schema";
import { newId } from "@/lib/id";
import { auth } from "@/auth";
import { checkPlainText } from "@/lib/sanitize";
import type { ReturnReason } from "@/lib/returns";

export interface RequestReturnResult {
  error?: string;
  success?: boolean;
}

const RETURN_WINDOW_DAYS = 30;

export async function requestReturnAction(orderItemId: string, reason: ReturnReason, note: string): Promise<RequestReturnResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to request a return." };

  const trimmedNote = note.trim();
  const textError = checkPlainText(trimmedNote, "Note");
  if (textError) return { error: textError };

  const [item] = await db.select().from(orderItems).where(eq(orderItems.id, orderItemId)).limit(1);
  if (!item) return { error: "Order item not found" };
  if (item.source !== "self") {
    return { error: "This item ships from our supplier — use the support option on that order instead." };
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, item.orderId)).limit(1);
  if (!order || order.userId !== session.user.id) return { error: "Order not found" };
  if (order.fulfillmentStatus !== "shipped" && order.fulfillmentStatus !== "delivered") {
    return { error: "This item hasn't shipped yet" };
  }

  const daysSincePlaced = (Date.now() - order.placedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePlaced > RETURN_WINDOW_DAYS) {
    return { error: `Returns must be requested within ${RETURN_WINDOW_DAYS} days of your order date` };
  }

  const [existing] = await db
    .select({ id: returns.id })
    .from(returns)
    .where(and(eq(returns.orderItemId, orderItemId), inArray(returns.status, ["requested", "refunded"])))
    .limit(1);
  if (existing) return { error: "A return has already been requested for this item" };

  // Refund the item's proportional share of what was actually paid, not
  // its raw undiscounted price — an order-level discount (promo code,
  // loyalty tier, or bundle) reduces every line item's effective price
  // together, so a returned item should give back less than its sticker
  // price if the order got a discount. Verified via QA: without this,
  // returning one item from a 20%-off order refunded the full pre-discount
  // price, overpaying the customer by the discount amount.
  const itemLineTotalCents = item.priceCents * item.quantity;
  const orderDiscountCents = order.discountCents + order.bundleDiscountCents;
  const proportionalDiscountCents =
    order.subtotalCents > 0 ? Math.round((itemLineTotalCents / order.subtotalCents) * orderDiscountCents) : 0;
  const refundAmountCents = Math.max(0, itemLineTotalCents - proportionalDiscountCents);

  await db.insert(returns).values({
    id: newId(),
    orderId: order.id,
    orderItemId,
    userId: session.user.id,
    productId: item.productId,
    productTitle: item.title,
    quantity: item.quantity,
    reason,
    note: trimmedNote || null,
    status: "requested",
    refundAmountCents,
  });

  revalidatePath("/account/orders");
  return { success: true };
}
