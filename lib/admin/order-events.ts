import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderEvents } from "@/db/schema";
import { newId } from "@/lib/id";

export type OrderEventType = (typeof orderEvents.$inferSelect)["type"];

export interface OrderEvent {
  id: string;
  type: OrderEventType;
  message: string;
  actor: string;
  createdAt: string;
}

/**
 * Appends to an order's audit trail. Deliberately never throws: a timeline
 * entry is a record of something that already happened, so failing to write
 * it must not roll back or block the action it describes. A missing line in
 * the history is a far smaller problem than a refund that errors after the
 * money already moved.
 */
export async function recordOrderEvent(
  orderId: string,
  type: OrderEventType,
  message: string,
  actor = "System"
): Promise<void> {
  try {
    await db.insert(orderEvents).values({ id: newId(), orderId, type, message, actor });
  } catch {
    // Intentionally swallowed — see above.
  }
}

/** Oldest first: a timeline reads top-down, unlike the dashboard's newest-first activity feed. */
export async function getOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const rows = await db
    .select()
    .from(orderEvents)
    .where(eq(orderEvents.orderId, orderId))
    .orderBy(asc(orderEvents.createdAt));

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    message: r.message,
    actor: r.actor,
    createdAt: r.createdAt.toISOString(),
  }));
}
