"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shippingRates, carriers } from "@/db/schema";
import { newId } from "@/lib/id";
import { toCents } from "@/lib/money";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { checkPlainText } from "@/lib/sanitize";
import type { ShippingRateStatus } from "@/lib/admin/shipping";

export interface ShippingActionResult {
  error?: string;
}

export interface ShippingRateInput {
  zone: string;
  method: string;
  condition: string;
  rate: number;
  deliveryEstimate: string;
  status: ShippingRateStatus;
  carrierId: string | null;
  minSubtotal: number | null;
  maxSubtotal: number | null;
}

export async function createShippingRateAction(input: ShippingRateInput): Promise<ShippingActionResult> {
  const zone = input.zone.trim();
  const method = input.method.trim();
  const condition = input.condition.trim();
  const deliveryEstimate = input.deliveryEstimate.trim();
  if (!zone || !method || !condition || !deliveryEstimate) return { error: "All fields are required" };
  const textError =
    checkPlainText(zone, "Zone") ??
    checkPlainText(method, "Method") ??
    checkPlainText(condition, "Condition") ??
    checkPlainText(deliveryEstimate, "Delivery estimate");
  if (textError) return { error: textError };
  if (input.rate < 0) return { error: "Rate can't be negative" };
  if (input.minSubtotal != null && input.maxSubtotal != null && input.minSubtotal > input.maxSubtotal) {
    return { error: "Minimum order value can't be greater than the maximum" };
  }

  await db.insert(shippingRates).values({
    id: newId(),
    zone,
    method,
    condition,
    rateCents: toCents(input.rate),
    deliveryEstimate,
    status: input.status,
    carrierId: input.carrierId,
    minSubtotalCents: input.minSubtotal != null ? toCents(input.minSubtotal) : null,
    maxSubtotalCents: input.maxSubtotal != null ? toCents(input.maxSubtotal) : null,
  });

  const actor = await getAdminActorName();
  await logActivity("system", `Shipping rate "${zone} — ${method}" created`, actor);
  revalidatePath("/admin/shipping");
  return {};
}

export async function updateShippingRateAction(id: string, input: ShippingRateInput): Promise<ShippingActionResult> {
  const zone = input.zone.trim();
  const method = input.method.trim();
  const condition = input.condition.trim();
  const deliveryEstimate = input.deliveryEstimate.trim();
  if (!zone || !method || !condition || !deliveryEstimate) return { error: "All fields are required" };
  const textError =
    checkPlainText(zone, "Zone") ??
    checkPlainText(method, "Method") ??
    checkPlainText(condition, "Condition") ??
    checkPlainText(deliveryEstimate, "Delivery estimate");
  if (textError) return { error: textError };
  if (input.rate < 0) return { error: "Rate can't be negative" };
  if (input.minSubtotal != null && input.maxSubtotal != null && input.minSubtotal > input.maxSubtotal) {
    return { error: "Minimum order value can't be greater than the maximum" };
  }

  await db
    .update(shippingRates)
    .set({
      zone,
      method,
      condition,
      rateCents: toCents(input.rate),
      deliveryEstimate,
      status: input.status,
      carrierId: input.carrierId,
      minSubtotalCents: input.minSubtotal != null ? toCents(input.minSubtotal) : null,
      maxSubtotalCents: input.maxSubtotal != null ? toCents(input.maxSubtotal) : null,
    })
    .where(eq(shippingRates.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Shipping rate "${zone} — ${method}" updated`, actor);
  revalidatePath("/admin/shipping");
  return {};
}

export async function deleteShippingRateAction(id: string, label: string): Promise<ShippingActionResult> {
  await db.delete(shippingRates).where(eq(shippingRates.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Shipping rate "${label}" deleted`, actor);
  revalidatePath("/admin/shipping");
  return {};
}

export async function updateCarrierAction(
  id: string,
  input: { connected: boolean; servicesUsed: string[] }
): Promise<ShippingActionResult> {
  for (const service of input.servicesUsed) {
    const textError = checkPlainText(service, "Service");
    if (textError) return { error: textError };
  }

  await db.update(carriers).set({ connected: input.connected, servicesUsed: input.servicesUsed }).where(eq(carriers.id, id));

  const actor = await getAdminActorName();
  const [carrier] = await db.select().from(carriers).where(eq(carriers.id, id)).limit(1);
  await logActivity(
    "system",
    `Carrier ${carrier?.name ?? id} ${input.connected ? "connected" : "disconnected"}`,
    actor
  );
  revalidatePath("/admin/shipping");
  return {};
}
