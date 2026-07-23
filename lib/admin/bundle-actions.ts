"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bundles, bundleItems } from "@/db/schema";
import { newId } from "@/lib/id";
import { toCents } from "@/lib/money";
import { checkPlainText } from "@/lib/sanitize";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";
import type { BundleDiscountType, BundleStatus } from "@/lib/admin/bundles";

export interface BundleActionResult {
  error?: string;
}

export interface BundleInput {
  name: string;
  description: string;
  discountType: BundleDiscountType;
  discountPercent?: number;
  discountAmount?: number;
  status: BundleStatus;
  productIds: string[];
}

function validateInput(input: BundleInput): string | null {
  const name = input.name.trim();
  if (!name) return "Name is required";
  const textError = checkPlainText(name, "Name") ?? checkPlainText(input.description, "Description");
  if (textError) return textError;
  if (input.productIds.length < 2) return "A bundle needs at least 2 products";
  if (new Set(input.productIds).size !== input.productIds.length) return "Each product can only appear once in a bundle";
  if (input.discountType === "percent" && (!input.discountPercent || input.discountPercent < 1 || input.discountPercent > 100)) {
    return "Percent discount must be between 1 and 100";
  }
  if (input.discountType === "fixed" && (!input.discountAmount || input.discountAmount <= 0)) {
    return "Fixed discount amount must be greater than $0";
  }
  return null;
}

function revalidateBundleViews() {
  revalidatePath("/admin/bundles");
  revalidatePath("/", "layout");
}

export async function createBundleAction(input: BundleInput): Promise<BundleActionResult> {
  const guard = await requirePermission("bundles");
  if (guard) return guard;

  const error = validateInput(input);
  if (error) return { error };
  const name = input.name.trim();

  const bundleId = newId();
  await db.insert(bundles).values({
    id: bundleId,
    name,
    description: input.description.trim() || null,
    discountType: input.discountType,
    discountPercent: input.discountType === "percent" ? input.discountPercent! : null,
    discountAmountCents: input.discountType === "fixed" ? toCents(input.discountAmount!) : null,
    status: input.status,
  });
  await db.insert(bundleItems).values(input.productIds.map((productId) => ({ id: newId(), bundleId, productId })));

  const actor = await getAdminActorName();
  await logActivity("product", `Bundle "${name}" created`, actor);
  revalidateBundleViews();
  return {};
}

export async function updateBundleAction(id: string, input: BundleInput): Promise<BundleActionResult> {
  const guard = await requirePermission("bundles");
  if (guard) return guard;

  const error = validateInput(input);
  if (error) return { error };
  const name = input.name.trim();

  await db
    .update(bundles)
    .set({
      name,
      description: input.description.trim() || null,
      discountType: input.discountType,
      discountPercent: input.discountType === "percent" ? input.discountPercent! : null,
      discountAmountCents: input.discountType === "fixed" ? toCents(input.discountAmount!) : null,
      status: input.status,
    })
    .where(eq(bundles.id, id));

  await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));
  await db.insert(bundleItems).values(input.productIds.map((productId) => ({ id: newId(), bundleId: id, productId })));

  const actor = await getAdminActorName();
  await logActivity("product", `Bundle "${name}" updated`, actor);
  revalidateBundleViews();
  return {};
}

export async function deleteBundleAction(id: string, name: string): Promise<BundleActionResult> {
  const guard = await requirePermission("bundles");
  if (guard) return guard;

  await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));
  await db.delete(bundles).where(eq(bundles.id, id));

  const actor = await getAdminActorName();
  await logActivity("product", `Bundle "${name}" deleted`, actor);
  revalidateBundleViews();
  return {};
}
