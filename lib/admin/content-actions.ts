"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { newId } from "@/lib/id";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { ContentType, ContentStatus } from "@/lib/admin/content";

export interface ContentActionResult {
  error?: string;
}

export interface ContentInput {
  title: string;
  type: ContentType;
  location: string;
  status: ContentStatus;
}

export async function createContentAction(input: ContentInput): Promise<ContentActionResult> {
  const title = input.title.trim();
  const location = input.location.trim();
  if (!title) return { error: "Title is required" };
  if (!location) return { error: "Location is required" };

  await db.insert(contentItems).values({
    id: newId(),
    title,
    type: input.type,
    location,
    status: input.status,
  });

  const actor = await getAdminActorName();
  await logActivity("system", `Content "${title}" created`, actor);
  revalidatePath("/admin/content");
  return {};
}

export async function updateContentAction(id: string, input: ContentInput): Promise<ContentActionResult> {
  const title = input.title.trim();
  const location = input.location.trim();
  if (!title) return { error: "Title is required" };
  if (!location) return { error: "Location is required" };

  await db.update(contentItems).set({ title, type: input.type, location, status: input.status }).where(eq(contentItems.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Content "${title}" updated`, actor);
  revalidatePath("/admin/content");
  return {};
}

export async function deleteContentAction(id: string, title: string): Promise<ContentActionResult> {
  await db.delete(contentItems).where(eq(contentItems.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Content "${title}" deleted`, actor);
  revalidatePath("/admin/content");
  return {};
}
