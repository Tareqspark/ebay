"use server";

import { auth } from "@/auth";
import { findOrderByNumberForUser } from "@/lib/orders";
import type { CustomerOrder } from "@/lib/orders";

export interface TrackOrderState {
  error?: string;
  order?: CustomerOrder;
}

export async function trackOrderAction(_prev: TrackOrderState, formData: FormData): Promise<TrackOrderState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in to track your order" };
  }

  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  if (!orderNumber) return { error: "Enter an order number" };

  const order = await findOrderByNumberForUser(session.user.id, orderNumber);
  if (!order) return { error: "We couldn't find that order on your account. Double-check the order number and try again." };

  return { order };
}
