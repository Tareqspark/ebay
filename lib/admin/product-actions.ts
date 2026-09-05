"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productMeta, inventory, categories } from "@/db/schema";
import { toCents } from "@/lib/money";
import { newId } from "@/lib/id";
import { checkPlainText } from "@/lib/sanitize";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity, diffFields, describeChanges } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";
import type { ProductStatus, ProductVisibility } from "@/lib/admin/types";

export interface ProductActionResult {
  error?: string;
}

function revalidateProductViews() {
  revalidatePath("/admin/products");
}

export interface ProductDetailsInput {
  title: string;
  description: string;
  /** Leaf (grandchild) category id. */
  categoryId: string;
}

/**
 * Edits the fields an admin can change from the product panel.
 *
 * The panel previously showed Title as an input, Description as read-only
 * text, and Category as a disabled box — then offered a "Save changes" button
 * that fired a success toast and wrote nothing. So a recategorisation looked
 * like it worked and didn't.
 *
 * categoryId and categorySlugPath are written together, from the same lookup.
 * They must never disagree: the storefront resolves a product's category by
 * walking categorySlugPath, while the admin reads categoryId, so setting one
 * alone makes a product appear filed correctly in the admin and land nowhere
 * (or somewhere wrong) on the site.
 */
export async function updateProductDetailsAction(
  productId: string,
  input: ProductDetailsInput
): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  const title = input.title.trim();
  if (!title) return { error: "Title is required" };
  if (title.length > 255) return { error: "Title must be 255 characters or fewer" };
  const description = input.description.trim();
  if (description.length > 2000) return { error: "Description must be 2000 characters or fewer" };
  const unsafe = checkPlainText(title, "Title") ?? checkPlainText(description, "Description");
  if (unsafe) return { error: unsafe };

  const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!existing) return { error: "Product not found" };
  // Named, not id'd: an id in the log tells a reader nothing, and the slug
  // path is already carried on the row so this costs no extra query.
  const existingCategoryPath = (existing.categorySlugPath ?? []).join(" > ");

  // Only a leaf is a valid destination — a product's categorySlugPath has
  // three segments, so filing it under a top or child category yields a path
  // no storefront route resolves.
  const [leaf] = await db.select().from(categories).where(eq(categories.id, input.categoryId)).limit(1);
  if (!leaf || leaf.level !== "grandchild") return { error: "Pick a specific bottom-level category" };
  const child = leaf.parentId ? (await db.select().from(categories).where(eq(categories.id, leaf.parentId)).limit(1))[0] : undefined;
  const top = child?.parentId ? (await db.select().from(categories).where(eq(categories.id, child.parentId)).limit(1))[0] : undefined;
  if (!child || !top) return { error: "That category is missing a parent — fix it under Categories first" };

  await db
    .update(products)
    .set({
      title,
      description,
      categoryId: leaf.id,
      categorySlugPath: [top.slug, child.slug, leaf.slug],
    })
    .where(eq(products.id, productId));

  /**
   * The old values are read from the row fetched before the update, so the
   * log records what a field was as well as what it became. The message alone
   * never could: it named the product by a title the edit may have changed.
   */
  const changes = diffFields(
    { title: existing.title, description: existing.description, category: existingCategoryPath },
    { title, description, category: `${top.name} > ${child.name} > ${leaf.name}` }
  );
  const moved = existing.categoryId !== leaf.id;
  await logActivity(
    "product",
    Object.keys(changes).length === 0
      ? `Product "${title}" saved with no changes`
      : moved
        ? `Product "${title}" moved to ${top.name} > ${child.name} > ${leaf.name}`
        : `Product "${title}": ${describeChanges(changes)} changed`,
    await getAdminActorName(),
    productId,
    changes
  );

  revalidateProductViews();
  // The storefront caches category and product pages at the layout level, so
  // a move has to invalidate there too or the product lingers in its old
  // category until the next deploy.
  revalidatePath("/", "layout");
  return {};
}

export async function updateProductPriceAction(productId: string, price: number): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  if (!Number.isFinite(price) || price < 0) return { error: "Price can't be negative" };
  // Price and cost edits were not logged at all before, so a margin could move
  // with nothing recording who moved it.
  const [before] = await db.select({ title: products.title, priceCents: products.priceCents })
    .from(products).where(eq(products.id, productId)).limit(1);
  await db.update(products).set({ priceCents: toCents(price) }).where(eq(products.id, productId));

  const changes = diffFields(
    { price: before ? (before.priceCents / 100).toFixed(2) : null },
    { price: price.toFixed(2) }
  );
  if (Object.keys(changes).length > 0) {
    await logActivity("product", `Product "${before?.title ?? productId}" price changed`,
      await getAdminActorName(), productId, changes);
  }
  revalidateProductViews();
  return {};
}

export async function updateProductCostAction(productId: string, cost: number): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  if (!Number.isFinite(cost) || cost < 0) return { error: "Cost can't be negative" };
  const [before] = await db
    .select({ title: products.title, costCents: productMeta.costCents })
    .from(productMeta)
    .innerJoin(products, eq(products.id, productMeta.productId))
    .where(eq(productMeta.productId, productId))
    .limit(1);
  await db.update(productMeta).set({ costCents: toCents(cost) }).where(eq(productMeta.productId, productId));

  const changes = diffFields(
    { cost: before ? (before.costCents / 100).toFixed(2) : null },
    { cost: cost.toFixed(2) }
  );
  if (Object.keys(changes).length > 0) {
    await logActivity("product", `Product "${before?.title ?? productId}" cost changed`,
      await getAdminActorName(), productId, changes);
  }
  revalidateProductViews();
  return {};
}

/**
 * A bulk action writes one event per product, up to a point.
 *
 * Per-product is what an audit needs — "who hid this item" has to be
 * answerable for each one. But a 20,000-row bulk update would write 20,000
 * events, so past BULK_DETAIL_LIMIT it falls back to a single summary. The
 * threshold is where a person could plausibly review the list by hand.
 */
const BULK_DETAIL_LIMIT = 50;

export async function setProductStatusAction(productIds: string[], status: ProductStatus): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  if (productIds.length === 0) return {};
  const previous = await db
    .select({ id: productMeta.productId, title: products.title, status: productMeta.status })
    .from(productMeta)
    .innerJoin(products, eq(products.id, productMeta.productId))
    .where(inArray(productMeta.productId, productIds));
  await db.update(productMeta).set({ status }).where(inArray(productMeta.productId, productIds));

  const actor = await getAdminActorName();
  if (previous.length <= BULK_DETAIL_LIMIT) {
    for (const row of previous) {
      const changes = diffFields({ status: row.status }, { status });
      if (Object.keys(changes).length === 0) continue;
      await logActivity("product", `Product "${row.title}" status set to ${status}`, actor, row.id, changes);
    }
  } else {
    await logActivity("product", `${productIds.length} products set to ${status}`, actor);
  }
  revalidateProductViews();
  return {};
}

export async function setProductVisibilityAction(
  productIds: string[],
  visibility: ProductVisibility
): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  if (productIds.length === 0) return {};
  const previous = await db
    .select({ id: productMeta.productId, title: products.title, visibility: productMeta.visibility })
    .from(productMeta)
    .innerJoin(products, eq(products.id, productMeta.productId))
    .where(inArray(productMeta.productId, productIds));
  await db.update(productMeta).set({ visibility }).where(inArray(productMeta.productId, productIds));

  const actor = await getAdminActorName();
  if (previous.length <= BULK_DETAIL_LIMIT) {
    for (const row of previous) {
      const changes = diffFields({ visibility: row.visibility }, { visibility });
      if (Object.keys(changes).length === 0) continue;
      await logActivity("product", `Product "${row.title}" set to ${visibility}`, actor, row.id, changes);
    }
  } else {
    await logActivity("product", `${productIds.length} products set to ${visibility}`, actor);
  }
  revalidateProductViews();
  return {};
}

/**
 * Real delete. Order line items keep their own denormalized title/image/
 * price snapshot (see db/schema.ts's order_items), so removing a product
 * doesn't corrupt past order history — only product_meta/inventory rows,
 * which exist solely to describe the live catalog entry, are cleaned up
 * alongside it.
 */
export async function deleteProductsAction(productIds: string[]): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  if (productIds.length === 0) return {};
  /**
   * Read before the delete, because afterwards there is nothing to read. A
   * deletion is the one change where the log is the only surviving record of
   * what the row held.
   */
  const doomed = await db
    .select({ id: products.id, title: products.title, slug: products.slug, priceCents: products.priceCents })
    .from(products)
    .where(inArray(products.id, productIds));

  await db.delete(inventory).where(inArray(inventory.productId, productIds));
  await db.delete(productMeta).where(inArray(productMeta.productId, productIds));
  await db.delete(products).where(inArray(products.id, productIds));

  const actor = await getAdminActorName();
  if (doomed.length <= BULK_DETAIL_LIMIT) {
    for (const row of doomed) {
      await logActivity("product", `Product "${row.title}" deleted`, actor, row.id, {
        title: { from: row.title, to: null },
        slug: { from: row.slug, to: null },
        price: { from: (row.priceCents / 100).toFixed(2), to: null },
      });
    }
  } else {
    await logActivity("product", `${doomed.length} products deleted`, actor);
  }
  revalidateProductViews();
  revalidatePath("/admin/inventory");
  return {};
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  cost: number;
  /** Optional compare-at price shown struck through on the storefront. */
  originalPrice?: number;
  images: string[];
  /** Leaf category the product belongs to; its ancestors are derived from the tree. */
  categorySlugPath: string[];
  brandId: string;
  stock: number;
  sku: string;
  warehouse: string;
  freeShipping: boolean;
  /** Shipping dimensions, in the units USPS consumes. Zero means not measured. */
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  status: ProductStatus;
  visibility: ProductVisibility;
}

function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || newId().toLowerCase()
  );
}

async function uniqueProductSlug(title: string): Promise<string> {
  const base = slugifyTitle(title).slice(0, 180);
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, candidate)).limit(1);
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix++;
  }
}

function validateCreate(input: CreateProductInput): string | null {
  const title = input.title.trim();
  if (!title) return "Title is required";
  const textError = checkPlainText(title, "Title") ?? checkPlainText(input.description, "Description");
  if (textError) return textError;
  if (input.images.length === 0) return "Add at least one product photo";
  if (input.categorySlugPath.length !== 3) return "Choose a category down to the third level";
  if (!input.brandId) return "Choose a brand";
  if (!(input.price > 0)) return "Price must be greater than $0";
  if (input.cost < 0) return "Cost can't be negative";
  if (input.originalPrice != null && input.originalPrice <= input.price) {
    return "Compare-at price must be higher than the selling price";
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) return "Stock must be a whole number of units";
  if (!input.sku.trim()) return "SKU is required";

  // Required because we ship these ourselves and USPS prices by weight — a
  // rate quoted from a missing weight is a guess presented to the customer
  // as a price. Dimensions are optional: USPS only needs them once a parcel
  // is large enough to be priced by size.
  if (!(input.weightOz > 0)) return "Shipping weight is required — USPS prices by weight";
  if (input.weightOz > 1120) return "Weight over 70 lb (1,120 oz) exceeds the USPS parcel limit";
  for (const [label, value] of [["Length", input.lengthIn], ["Width", input.widthIn], ["Height", input.heightIn]] as const) {
    if (value < 0) return `${label} can't be negative`;
    if (value > 108) return `${label} over 108 in exceeds the USPS size limit`;
  }
  return null;
}

/**
 * Creates an own-brand ("self") product — the other half of the hybrid model
 * from CJ imports, which reach the catalog through scripts/import-cj-products.ts.
 * Writes the same three tables that importer does, because the storefront and
 * admin both assume all three exist for every product: `products` (what
 * shoppers see), `product_meta` (source/cost/status, which drives margin and
 * visibility) and `inventory` (the stock record the fulfilment side reads).
 * Missing any one of them yields a product that renders but can't be sold or
 * counted.
 */
export async function createProductAction(input: CreateProductInput): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  const error = validateCreate(input);
  if (error) return { error };

  const title = input.title.trim();
  const slug = await uniqueProductSlug(title);
  const productId = newId();
  const leafSlug = input.categorySlugPath[2];

  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, leafSlug)).limit(1);
  if (!category) return { error: "That category no longer exists — pick another" };

  const [existingSku] = await db.select({ sku: inventory.sku }).from(inventory).where(eq(inventory.sku, input.sku.trim())).limit(1);
  if (existingSku) return { error: `SKU "${input.sku.trim()}" is already in use` };

  await db.insert(products).values({
    id: productId,
    slug,
    title,
    brandId: input.brandId,
    priceCents: toCents(input.price),
    originalPriceCents: input.originalPrice != null ? toCents(input.originalPrice) : null,
    images: input.images,
    categoryId: category.id,
    categorySlugPath: input.categorySlugPath,
    freeShipping: input.freeShipping,
    weightOz: Math.round(input.weightOz),
    lengthIn: input.lengthIn.toFixed(2),
    widthIn: input.widthIn.toFixed(2),
    heightIn: input.heightIn.toFixed(2),
    stock: input.stock,
    description: input.description.trim(),
    features: [],
  });

  await db.insert(productMeta).values({
    productId,
    source: "self",
    costCents: toCents(input.cost),
    status: input.status,
    visibility: input.visibility,
  });

  await db.insert(inventory).values({
    sku: input.sku.trim(),
    productId,
    source: "self",
    warehouse: input.warehouse.trim() || "Main",
    available: input.stock,
    reserved: 0,
    incoming: 0,
    status: input.stock === 0 ? "out_of_stock" : input.stock <= 10 ? "low_stock" : "in_stock",
  });

  const actor = await getAdminActorName();
  await logActivity("product", `Product "${title}" created`, actor);
  revalidateProductViews();
  revalidatePath("/", "layout");
  return {};
}
