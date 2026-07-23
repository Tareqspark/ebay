"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cjSourcingRequests } from "@/db/schema";
import { newId } from "@/lib/id";
import { submitCjSourcingRequest } from "@/lib/cj-provider";
import { checkPlainText } from "@/lib/sanitize";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";

export interface CjSourcingActionResult {
  error?: string;
}

export async function submitSourcingRequestAction(
  productName: string,
  referenceUrl: string,
  notes: string
): Promise<CjSourcingActionResult> {
  const guard = await requirePermission("cj");
  if (guard) return guard;

  const trimmedName = productName.trim();
  const trimmedUrl = referenceUrl.trim();
  const trimmedNotes = notes.trim();
  if (!trimmedName) return { error: "Product name is required" };

  const textError = checkPlainText(trimmedName, "Product name") ?? checkPlainText(trimmedNotes, "Notes");
  if (textError) return { error: textError };

  const { cjRequestId } = await submitCjSourcingRequest(trimmedName, trimmedUrl || null, trimmedNotes);

  await db.insert(cjSourcingRequests).values({
    id: newId(),
    productName: trimmedName,
    referenceUrl: trimmedUrl || null,
    notes: trimmedNotes,
    status: "submitted",
  });

  const actor = await getAdminActorName();
  await logActivity("system", `Sourcing request submitted to CJdropshipping: "${trimmedName}" (${cjRequestId})`, actor);
  revalidatePath("/admin/cj/sourcing");
  revalidatePath("/admin/cj/settings");
  return {};
}
