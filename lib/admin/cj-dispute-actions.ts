"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cjDisputes } from "@/db/schema";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { CjDisputeStatus } from "@/lib/admin/cj-types";

export interface CjDisputeActionResult {
  error?: string;
}

async function setDisputeStatus(disputeId: string, status: CjDisputeStatus, activityMessage: (productTitle: string) => string) {
  const [dispute] = await db.select().from(cjDisputes).where(eq(cjDisputes.id, disputeId)).limit(1);
  if (!dispute) return { error: "Dispute not found" };

  await db.update(cjDisputes).set({ status }).where(eq(cjDisputes.id, disputeId));

  const actor = await getAdminActorName();
  await logActivity("order", activityMessage(dispute.productTitle), actor);
  revalidatePath("/admin/cj/after-sales");
  return {};
}

/** requestedResolution decides which of the two "resolved_*" statuses this dispute moves to — mirrors what the customer/CJ actually asked for. */
export async function resolveCjDisputeAction(
  disputeId: string,
  resolution: "resolved_reship" | "resolved_refund"
): Promise<CjDisputeActionResult> {
  return setDisputeStatus(
    disputeId,
    resolution,
    (title) => `Dispute for "${title}" resolved — ${resolution === "resolved_reship" ? "reshipment requested from CJ" : "refund requested from CJ"}`
  );
}

export async function rejectCjDisputeAction(disputeId: string): Promise<CjDisputeActionResult> {
  return setDisputeStatus(disputeId, "rejected", (title) => `Dispute for "${title}" rejected`);
}
