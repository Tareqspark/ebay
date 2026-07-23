"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { newId } from "@/lib/id";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { checkPlainText } from "@/lib/sanitize";
import { requirePermission } from "@/lib/admin/permissions";

export interface ApiKeyActionResult {
  error?: string;
  id?: string;
  prefix?: string;
}

function randomPrefix(): string {
  return `bsk_live_${Math.random().toString(16).slice(2, 6)}`;
}

export async function createApiKeyAction(name: string): Promise<ApiKeyActionResult> {
  const guard = await requirePermission("settings");
  if (guard) return guard;

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required" };
  const textError = checkPlainText(trimmed, "Name");
  if (textError) return { error: textError };

  const id = newId();
  const prefix = randomPrefix();
  await db.insert(apiKeys).values({ id, name: trimmed, prefix, scopes: [] });

  const actor = await getAdminActorName();
  await logActivity("system", `API key "${trimmed}" created`, actor);
  revalidatePath("/admin/settings/security");
  return { id, prefix };
}

export async function regenerateApiKeyAction(id: string): Promise<ApiKeyActionResult> {
  const guard = await requirePermission("settings");
  if (guard) return guard;

  const prefix = randomPrefix();
  await db.update(apiKeys).set({ prefix, lastUsedAt: null }).where(eq(apiKeys.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `API key regenerated`, actor);
  revalidatePath("/admin/settings/security");
  return { prefix };
}

export async function revokeApiKeyAction(id: string): Promise<ApiKeyActionResult> {
  const guard = await requirePermission("settings");
  if (guard) return guard;

  await db.delete(apiKeys).where(eq(apiKeys.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `API key revoked`, actor);
  revalidatePath("/admin/settings/security");
  return {};
}
