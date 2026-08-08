import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, shipments, shipmentItems } from "@/db/schema";
import { newId } from "@/lib/id";

export interface ShipmentLine {
  orderItemId: string;
  title: string;
  quantity: number;
}

export interface Shipment {
  id: string;
  source: "self" | "cj";
  carrier?: string;
  trackingNumber?: string;
  shippedAt: string;
  items: ShipmentLine[];
}

export async function getShipments(orderId: string): Promise<Shipment[]> {
  const rows = await db.select().from(shipments).where(eq(shipments.orderId, orderId)).orderBy(asc(shipments.shippedAt));
  if (rows.length === 0) return [];

  const [lines, itemRows] = await Promise.all([
    db.select().from(shipmentItems).where(inArray(shipmentItems.shipmentId, rows.map((r) => r.id))),
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
  ]);
  const titleByItemId = new Map(itemRows.map((i) => [i.id, i.title]));

  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    carrier: r.carrier ?? undefined,
    trackingNumber: r.trackingNumber ?? undefined,
    shippedAt: r.shippedAt.toISOString(),
    items: lines
      .filter((l) => l.shipmentId === r.id)
      .map((l) => ({
        orderItemId: l.orderItemId,
        title: titleByItemId.get(l.orderItemId) ?? l.orderItemId,
        quantity: l.quantity,
      })),
  }));
}

/**
 * The order's fulfilment status is a *consequence* of its line items, never
 * set independently: nothing shipped is "unfulfilled", everything shipped is
 * "shipped", and anything between is "processing". Deriving it means a
 * partially shipped order can't sit there claiming to be fully shipped
 * because someone pressed the wrong button.
 *
 * "cancelled" and "delivered" are left alone — both are decisions a human
 * made about the whole order that item counts can't second-guess.
 */
export async function syncOrderFulfillmentStatus(orderId: string): Promise<void> {
  const [order] = await db
    .select({ status: orders.fulfillmentStatus })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order || ["cancelled", "delivered"].includes(order.status)) return;

  const items = await db
    .select({ quantity: orderItems.quantity, fulfilled: orderItems.fulfilledQuantity })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  if (items.length === 0) return;

  const totalOrdered = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalShipped = items.reduce((sum, i) => sum + Math.min(i.fulfilled, i.quantity), 0);

  const status = totalShipped === 0 ? "unfulfilled" : totalShipped >= totalOrdered ? "shipped" : "processing";
  await db.update(orders).set({ fulfillmentStatus: status }).where(eq(orders.id, orderId));
}

export interface CreateShipmentInput {
  orderId: string;
  source: "self" | "cj";
  carrier?: string;
  trackingNumber?: string;
  /** orderItemId → how many units of that line are in this parcel. */
  quantities: Record<string, number>;
}

export interface CreateShipmentResult {
  error?: string;
  shipmentId?: string;
}

/**
 * Records a parcel and advances the lines it contains. Quantities are checked
 * against what's actually outstanding, so a double-click or a stale form
 * can't ship more units than were ordered.
 */
export async function createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, input.orderId));
  const byId = new Map(items.map((i) => [i.id, i]));

  const lines = Object.entries(input.quantities)
    .map(([orderItemId, qty]) => ({ orderItemId, qty: Math.floor(Number(qty) || 0) }))
    .filter((l) => l.qty > 0);
  if (lines.length === 0) return { error: "Select at least one item to ship" };

  for (const line of lines) {
    const item = byId.get(line.orderItemId);
    if (!item) return { error: "That item isn't part of this order" };
    const outstanding = item.quantity - item.fulfilledQuantity;
    if (line.qty > outstanding) {
      return { error: `Only ${outstanding} × "${item.title}" left to ship` };
    }
  }

  const shipmentId = newId();
  await db.insert(shipments).values({
    id: shipmentId,
    orderId: input.orderId,
    source: input.source,
    carrier: input.carrier?.trim() || null,
    trackingNumber: input.trackingNumber?.trim() || null,
  });
  await db.insert(shipmentItems).values(
    lines.map((l) => ({ id: newId(), shipmentId, orderItemId: l.orderItemId, quantity: l.qty }))
  );

  for (const line of lines) {
    const item = byId.get(line.orderItemId)!;
    await db
      .update(orderItems)
      .set({ fulfilledQuantity: item.fulfilledQuantity + line.qty })
      .where(eq(orderItems.id, line.orderItemId));
  }

  await syncOrderFulfillmentStatus(input.orderId);
  return { shipmentId };
}
