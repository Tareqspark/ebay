"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { newId } from "@/lib/id";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { checkPlainText } from "@/lib/sanitize";
import { requirePermission } from "@/lib/admin/permissions";
import type { CollectionType, CollectionStatus } from "@/lib/admin/collections";

export interface CollectionActionResult {
  error?: string;
}

export interface CollectionInput {
  name: string;
  type: CollectionType;
  ruleDescription: string;
  status: CollectionStatus;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || newId();
}

export async function createCollectionAction(input: CollectionInput): Promise<CollectionActionResult> {
  const guard = await requirePermission("collections");
  if (guard) return guard;

  const name = input.name.trim();
  if (!name) return { error: "Name is required" };
  const textError = checkPlainText(name, "Name") ?? checkPlainText(input.ruleDescription, "Rule description");
  if (textError) return { error: textError };

  await db.insert(collections).values({
    id: newId(),
    name,
    type: input.type,
    ruleDescription: input.ruleDescription.trim() || null,
    status: input.status,
    imageSeed: slugify(name),
  });

  const actor = await getAdminActorName();
  await logActivity("product", `Collection "${name}" created`, actor);
  revalidatePath("/admin/collections");
  return {};
}

export async function updateCollectionAction(id: string, input: CollectionInput): Promise<CollectionActionResult> {
  const guard = await requirePermission("collections");
  if (guard) return guard;

  const name = input.name.trim();
  if (!name) return { error: "Name is required" };
  const textError = checkPlainText(name, "Name") ?? checkPlainText(input.ruleDescription, "Rule description");
  if (textError) return { error: textError };

  await db
    .update(collections)
    .set({
      name,
      type: input.type,
      ruleDescription: input.ruleDescription.trim() || null,
      status: input.status,
    })
    .where(eq(collections.id, id));

  const actor = await getAdminActorName();
  await logActivity("product", `Collection "${name}" updated`, actor);
  revalidatePath("/admin/collections");
  return {};
}

export async function deleteCollectionAction(id: string, name: string): Promise<CollectionActionResult> {
  const guard = await requirePermission("collections");
  if (guard) return guard;

  await db.delete(collections).where(eq(collections.id, id));

  const actor = await getAdminActorName();
  await logActivity("product", `Collection "${name}" deleted`, actor);
  revalidatePath("/admin/collections");
  return {};
}
