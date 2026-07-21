import "server-only";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { toDollars } from "@/lib/money";
import type { OrderAddress, OrderItem, PaymentStatus, FulfillmentStatus } from "@/lib/admin/types";

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: string;
  shippingAddress: OrderAddress;
  placedAt: string;
  updatedAt: string;
}

export async function getOrdersForUser(userId: string): Promise<CustomerOrder[]> {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.placedAt));
  const results: CustomerOrder[] = [];

  for (const row of rows) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, row.id));
    results.push({
      id: row.id,
      orderNumber: row.orderNumber,
      items: items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        price: toDollars(item.priceCents),
        source: item.source,
      })),
      subtotal: toDollars(row.subtotalCents),
      shipping: toDollars(row.shippingCents),
      tax: toDollars(row.taxCents),
      total: toDollars(row.totalCents),
      paymentStatus: row.paymentStatus,
      fulfillmentStatus: row.fulfillmentStatus,
      paymentMethod: row.paymentMethod,
      shippingAddress: row.shippingAddress,
      placedAt: row.placedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  return results;
}

export async function getOrderForUser(userId: string, orderId: string): Promise<CustomerOrder | null> {
  const all = await getOrdersForUser(userId);
  return all.find((o) => o.id === orderId) ?? null;
}
