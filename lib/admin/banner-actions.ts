"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { newId } from "@/lib/id";
import { checkPlainText, checkSafeUrl } from "@/lib/sanitize";
import { deleteBannerImage } from "@/lib/uploads";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";
import type { BannerPlacement, BannerLinkType, BannerStatus } from "@/lib/admin/banners";

export interface BannerActionResult {
  error?: string;
}

export interface BannerInput {
  name: string;
  imageUrl: string;
  altText: string;
  placement: BannerPlacement;
  linkType: BannerLinkType;
  linkValue: string;
  status: BannerStatus;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
}

function validate(input: BannerInput): string | null {
  const name = input.name.trim();
  if (!name) return "Name is required";
  if (!input.imageUrl.trim()) return "Upload a banner image";
  if (!input.altText.trim()) return "Alt text is required — it's what screen readers announce";

  const textError = checkPlainText(name, "Name") ?? checkPlainText(input.altText, "Alt text");
  if (textError) return textError;

  if (input.linkType !== "none") {
    const value = input.linkValue.trim();
    if (!value) return "Add a link destination, or set the link type to display-only";
    // Internal kinds store a bare slug that gets prefixed at render time, so
    // only the free-text external case can carry a dangerous scheme.
    if (input.linkType === "external") {
      const urlError = checkSafeUrl(value, "Link URL");
      if (urlError) return urlError;
    } else if (checkPlainText(value, "Link destination")) {
      return checkPlainText(value, "Link destination");
    }
  }

  if (input.startsAt && input.endsAt && new Date(input.endsAt) <= new Date(input.startsAt)) {
    return "End date must be after the start date";
  }
  return null;
}

/** Banners render in the root layout (top bar) and on several routes, so a change has to invalidate the whole tree, not one path. */
function revalidateBannerViews() {
  revalidatePath("/admin/marketing/banners");
  revalidatePath("/", "layout");
}

function toRow(input: BannerInput) {
  return {
    name: input.name.trim(),
    imageUrl: input.imageUrl.trim(),
    altText: input.altText.trim(),
    placement: input.placement,
    linkType: input.linkType,
    linkValue: input.linkType === "none" ? null : input.linkValue.trim(),
    status: input.status,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
    sortOrder: input.sortOrder,
  };
}

export async function createBannerAction(input: BannerInput): Promise<BannerActionResult> {
  const guard = await requirePermission("marketing");
  if (guard) return guard;

  const error = validate(input);
  if (error) return { error };

  await db.insert(banners).values({ id: newId(), ...toRow(input) });

  const actor = await getAdminActorName();
  await logActivity("product", `Banner "${input.name.trim()}" created`, actor);
  revalidateBannerViews();
  return {};
}

export async function updateBannerAction(id: string, input: BannerInput): Promise<BannerActionResult> {
  const guard = await requirePermission("marketing");
  if (guard) return guard;

  const error = validate(input);
  if (error) return { error };

  // A replaced image would otherwise sit on disk forever with nothing
  // pointing at it, since the row only ever holds the current URL.
  const [existing] = await db.select({ imageUrl: banners.imageUrl }).from(banners).where(eq(banners.id, id)).limit(1);
  await db.update(banners).set(toRow(input)).where(eq(banners.id, id));
  if (existing && existing.imageUrl !== input.imageUrl.trim()) {
    await deleteBannerImage(existing.imageUrl);
  }

  const actor = await getAdminActorName();
  await logActivity("product", `Banner "${input.name.trim()}" updated`, actor);
  revalidateBannerViews();
  return {};
}

export async function deleteBannerAction(id: string, name: string): Promise<BannerActionResult> {
  const guard = await requirePermission("marketing");
  if (guard) return guard;

  const [existing] = await db.select({ imageUrl: banners.imageUrl }).from(banners).where(eq(banners.id, id)).limit(1);
  await db.delete(banners).where(eq(banners.id, id));
  if (existing) await deleteBannerImage(existing.imageUrl);

  const actor = await getAdminActorName();
  await logActivity("product", `Banner "${name}" deleted`, actor);
  revalidateBannerViews();
  return {};
}
