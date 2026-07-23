import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { returns as returnsTable } from "@/db/schema";
import { toDollars } from "@/lib/money";

export type ReturnReason = (typeof returnsTable.$inferSelect)["reason"];
export type ReturnStatus = (typeof returnsTable.$inferSelect)["status"];

export interface CustomerReturn {
  id: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  productTitle: string;
  quantity: number;
  reason: ReturnReason;
  note?: string;
  status: ReturnStatus;
  refundAmount: number;
  adminNote?: string;
  requestedAt: string;
}

/** Keyed by orderItemId, so the order-history page can look up "does this line item already have a return?" in O(1). */
export async function getReturnsByOrderItemForUser(userId: string): Promise<Map<string, CustomerReturn>> {
  const rows = await db.select().from(returnsTable).where(eq(returnsTable.userId, userId));
  const map = new Map<string, CustomerReturn>();
  for (const r of rows) {
    map.set(r.orderItemId, {
      id: r.id,
      orderId: r.orderId,
      orderItemId: r.orderItemId,
      productId: r.productId,
      productTitle: r.productTitle,
      quantity: r.quantity,
      reason: r.reason,
      note: r.note ?? undefined,
      status: r.status,
      refundAmount: toDollars(r.refundAmountCents),
      adminNote: r.adminNote ?? undefined,
      requestedAt: r.requestedAt.toISOString(),
    });
  }
  return map;
}
