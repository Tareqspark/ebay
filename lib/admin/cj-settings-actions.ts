"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cjIntegrationSettings } from "@/db/schema";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";

export interface CjSettingsActionResult {
  error?: string;
}

export interface CjFulfillmentSettingsInput {
  autoPushOrders: boolean;
  defaultShippingLineId: string;
  syncFrequency: string;
}

export async function updateCjFulfillmentSettingsAction(input: CjFulfillmentSettingsInput): Promise<CjSettingsActionResult> {
  const guard = await requirePermission("cj");
  if (guard) return guard;

  await db
    .update(cjIntegrationSettings)
    .set({
      autoPushOrders: input.autoPushOrders,
      defaultShippingLineId: input.defaultShippingLineId || null,
      syncFrequency: input.syncFrequency,
    })
    .where(eq(cjIntegrationSettings.id, "default"));

  const actor = await getAdminActorName();
  await logActivity(
    "system",
    `CJdropshipping fulfillment defaults updated (auto-push ${input.autoPushOrders ? "on" : "off"}, sync ${input.syncFrequency})`,
    actor
  );
  revalidatePath("/admin/cj/settings");
  return {};
}
