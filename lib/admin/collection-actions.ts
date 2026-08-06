"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { collections, collectionItems } from "@/db/schema";
import { newId } from "@/lib/id";
import { toCents } from "@/lib/money";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { checkPlainText } from "@/lib/sanitize";
import { requirePermission } from "@/lib/admin/permissions";
import type { CollectionType, CollectionStatus, CollectionRuleInput } from "@/lib/admin/collections";

export interface CollectionActionResult {
  error?: string;
}

export interface CollectionInput {
  name: string;
  type: CollectionType;
  description: string;
  status: CollectionStatus;
  productIds: string[];
  rule: CollectionRuleInput;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || newId()
  );
}

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const [existing] = await db.select({ id: collections.id }).from(collections).where(eq(collections.slug, candidate)).limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix++;
  }
}

function validate(input: CollectionInput): string | null {
  const name = input.name.trim();
  if (!name) return "Name is required";
  const textError = checkPlainText(name, "Name") ?? checkPlainText(input.description, "Description");
  if (textError) return textError;
  if (input.type === "manual" && input.productIds.length === 0) {
    return "Add at least one product, or switch to Automated";
  }
  if (
    input.type === "automated" &&
    !input.rule.topCategorySlug &&
    input.rule.minPrice == null &&
    input.rule.maxPrice == null &&
    input.rule.minRating == null &&
    !input.rule.bundledOnly
  ) {
    return "Set at least one rule condition, or switch to Manual";
  }
  return null;
}

async function setCollectionItems(collectionId: string, productIds: string[]): Promise<void> {
  await db.delete(collectionItems).where(eq(collectionItems.collectionId, collectionId));
  if (productIds.length > 0) {
    await db.insert(collectionItems).values(productIds.map((productId) => ({ id: newId(), collectionId, productId })));
  }
}

function revalidateCollectionViews(slug?: string | null) {
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/collection/${slug}`);
}

export async function createCollectionAction(input: CollectionInput): Promise<CollectionActionResult> {
  const guard = await requirePermission("collections");
  if (guard) return guard;

  const error = validate(input);
  if (error) return { error };
  const name = input.name.trim();
  const slug = await uniqueSlug(name);
  const id = newId();

  await db.insert(collections).values({
    id,
    name,
    slug,
    type: input.type,
    ruleDescription: input.description.trim() || null,
    ruleTopCategorySlug: input.type === "automated" ? (input.rule.topCategorySlug ?? null) : null,
    ruleMinPriceCents: input.type === "automated" && input.rule.minPrice != null ? toCents(input.rule.minPrice) : null,
    ruleMaxPriceCents: input.type === "automated" && input.rule.maxPrice != null ? toCents(input.rule.maxPrice) : null,
    ruleMinRating: input.type === "automated" && input.rule.minRating != null ? input.rule.minRating.toFixed(1) : null,
    ruleBundledOnly: input.type === "automated" && !!input.rule.bundledOnly,
    status: input.status,
    imageSeed: slug,
  });
  if (input.type === "manual") await setCollectionItems(id, input.productIds);

  const actor = await getAdminActorName();
  await logActivity("product", `Collection "${name}" created`, actor);
  revalidateCollectionViews(slug);
  return {};
}

export async function updateCollectionAction(id: string, input: CollectionInput): Promise<CollectionActionResult> {
  const guard = await requirePermission("collections");
  if (guard) return guard;

  const error = validate(input);
  if (error) return { error };
  const name = input.name.trim();

  const [existing] = await db.select({ slug: collections.slug }).from(collections).where(eq(collections.id, id)).limit(1);
  const slug = existing?.slug ?? (await uniqueSlug(name, id));

  await db
    .update(collections)
    .set({
      name,
      type: input.type,
      ruleDescription: input.description.trim() || null,
      ruleTopCategorySlug: input.type === "automated" ? (input.rule.topCategorySlug ?? null) : null,
      ruleMinPriceCents: input.type === "automated" && input.rule.minPrice != null ? toCents(input.rule.minPrice) : null,
      ruleMaxPriceCents: input.type === "automated" && input.rule.maxPrice != null ? toCents(input.rule.maxPrice) : null,
      ruleMinRating: input.type === "automated" && input.rule.minRating != null ? input.rule.minRating.toFixed(1) : null,
      ruleBundledOnly: input.type === "automated" && !!input.rule.bundledOnly,
      status: input.status,
    })
    .where(eq(collections.id, id));
  await setCollectionItems(id, input.type === "manual" ? input.productIds : []);

  const actor = await getAdminActorName();
  await logActivity("product", `Collection "${name}" updated`, actor);
  revalidateCollectionViews(slug);
  return {};
}

export async function deleteCollectionAction(id: string, name: string): Promise<CollectionActionResult> {
  const guard = await requirePermission("collections");
  if (guard) return guard;

  await db.delete(collectionItems).where(eq(collectionItems.collectionId, id));
  await db.delete(collections).where(eq(collections.id, id));

  const actor = await getAdminActorName();
  await logActivity("product", `Collection "${name}" deleted`, actor);
  revalidateCollectionViews();
  return {};
}
