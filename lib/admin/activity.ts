import "server-only";
import { db } from "@/db";
import { activityEvents } from "@/db/schema";
import { newId } from "@/lib/id";
import type { ActivityType } from "@/lib/admin/types";

/**
 * Real audit-log write, called from checkout (customer-facing) and every
 * admin mutation server action. `actor` is a human label — the signed-in
 * staff member's name for admin actions, "Storefront" for customer-driven
 * events like a new order. Fire-and-forget from the caller's perspective:
 * failures are logged but never thrown, since a broken audit write should
 * never fail the mutation it's describing.
 */
export async function logActivity(type: ActivityType, message: string, actor: string): Promise<void> {
  try {
    await db.insert(activityEvents).values({ id: newId(), type, message, actor });
  } catch (err) {
    console.error("[activity] failed to write audit log entry", { type, message, actor }, err);
  }
}
