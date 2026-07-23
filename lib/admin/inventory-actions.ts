"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inventory } from "@/db/schema";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { computeInventoryStatus } from "@/lib/inventory";
import { requirePermission } from "@/lib/admin/permissions";

export interface InventoryActionResult {
  error?: string;
}

/** Manual stock correction (recount, damaged stock write-off, etc.) — sets available to an exact count rather than incrementing/decrementing, and recomputes status the same way checkout's automatic decrement does. */
export async function adjustInventoryAction(sku: string, nextAvailable: number): Promise<InventoryActionResult> {
  const guard = await requirePermission("inventory");
  if (guard) return guard;

  if (!Number.isFinite(nextAvailable) || !Number.isInteger(nextAvailable) || nextAvailable < 0) {
    return { error: "Available stock can't be negative" };
  }

  const [row] = await db.select().from(inventory).where(eq(inventory.sku, sku)).limit(1);
  if (!row) return { error: "Inventory record not found" };

  await db
    .update(inventory)
    .set({ available: nextAvailable, status: computeInventoryStatus(nextAvailable, row.incoming) })
    .where(eq(inventory.sku, sku));

  const actor = await getAdminActorName();
  await logActivity("product", `Stock for ${sku} adjusted to ${nextAvailable.toLocaleString()} units`, actor);
  revalidatePath("/admin/inventory");
  return {};
}
