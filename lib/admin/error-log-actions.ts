"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { errorLogs } from "@/db/schema";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";

export interface ErrorLogActionResult {
  error?: string;
}

export async function resolveErrorLogAction(id: string, resolved: boolean): Promise<ErrorLogActionResult> {
  const [log] = await db.select().from(errorLogs).where(eq(errorLogs.id, id)).limit(1);
  if (!log) return { error: "Error log not found" };

  await db.update(errorLogs).set({ resolved }).where(eq(errorLogs.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Error log "${log.label}" marked ${resolved ? "resolved" : "unresolved"}`, actor);
  revalidatePath("/admin/settings/errors");
  return {};
}
