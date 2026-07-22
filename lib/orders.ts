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
  discount: number;
  promoCode?: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: string;
  shippingAddress: OrderAddress;
  placedAt: string;
  updatedAt: string;
  trackingNumber?: string;
  carrier?: string;
  cjTrackingNumber?: string;
  cjSyncStatus?: string;
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
      discount: toDollars(row.discountCents),
      promoCode: row.promoCode ?? undefined,
      paymentStatus: row.paymentStatus,
      fulfillmentStatus: row.fulfillmentStatus,
      paymentMethod: row.paymentMethod,
      shippingAddress: row.shippingAddress,
      placedAt: row.placedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      trackingNumber: row.trackingNumber ?? undefined,
      carrier: row.carrier ?? undefined,
      cjTrackingNumber: row.cjTrackingNumber ?? undefined,
      cjSyncStatus: row.cjSyncStatus ?? undefined,
    });
  }

  return results;
}

export async function getOrderForUser(userId: string, orderId: string): Promise<CustomerOrder | null> {
  const all = await getOrdersForUser(userId);
  return all.find((o) => o.id === orderId) ?? null;
}

/** Case-insensitive order-number lookup, scoped to the signed-in user — powers the Track Your Order page. */
export async function findOrderByNumberForUser(userId: string, orderNumber: string): Promise<CustomerOrder | null> {
  const all = await getOrdersForUser(userId);
  const normalized = orderNumber.trim().toUpperCase();
  return all.find((o) => o.orderNumber.toUpperCase() === normalized) ?? null;
}
