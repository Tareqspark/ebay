import "server-only";
import { cache } from "react";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { returns as returnsTable, orders, users } from "@/db/schema";
import { toDollars } from "@/lib/money";

export type ReturnReason = (typeof returnsTable.$inferSelect)["reason"];
export type ReturnStatus = (typeof returnsTable.$inferSelect)["status"];

export interface AdminReturn {
  id: string;
  orderId: string;
  orderNumber: string;
  orderItemId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
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

export const getReturns = cache(async (): Promise<AdminReturn[]> => {
  const rows = await db.select().from(returnsTable).orderBy(desc(returnsTable.requestedAt));
  if (rows.length === 0) return [];

  const orderIds = [...new Set(rows.map((r) => r.orderId))];
  const userIds = [...new Set(rows.map((r) => r.userId))];
  const [orderRows, userRows] = await Promise.all([
    db.select({ id: orders.id, orderNumber: orders.orderNumber }).from(orders).where(inArray(orders.id, orderIds)),
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, userIds)),
  ]);
  const orderById = new Map(orderRows.map((o) => [o.id, o]));
  const userById = new Map(userRows.map((u) => [u.id, u]));

  return rows.map((r) => ({
    id: r.id,
    orderId: r.orderId,
    orderNumber: orderById.get(r.orderId)?.orderNumber ?? r.orderId,
    orderItemId: r.orderItemId,
    customerId: r.userId,
    customerName: userById.get(r.userId)?.name ?? r.userId,
    customerEmail: userById.get(r.userId)?.email ?? "",
    productId: r.productId,
    productTitle: r.productTitle,
    quantity: r.quantity,
    reason: r.reason,
    note: r.note ?? undefined,
    status: r.status,
    refundAmount: toDollars(r.refundAmountCents),
    adminNote: r.adminNote ?? undefined,
    requestedAt: r.requestedAt.toISOString(),
  }));
});
