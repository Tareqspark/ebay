"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productMeta, inventory, categories } from "@/db/schema";
import { toCents } from "@/lib/money";
import { newId } from "@/lib/id";
import { checkPlainText } from "@/lib/sanitize";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";
import type { ProductStatus, ProductVisibility } from "@/lib/admin/types";

export interface ProductActionResult {
  error?: string;
}

function revalidateProductViews() {
  revalidatePath("/admin/products");
}

export async function updateProductPriceAction(productId: string, price: number): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  if (!Number.isFinite(price) || price < 0) return { error: "Price can't be negative" };
  await db.update(products).set({ priceCents: toCents(price) }).where(eq(products.id, productId));
  revalidateProductViews();
  return {};
}

export async function updateProductCostAction(productId: string, cost: number): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  if (!Number.isFinite(cost) || cost < 0) return { error: "Cost can't be negative" };
  await db.update(productMeta).set({ costCents: toCents(cost) }).where(eq(productMeta.productId, productId));
  revalidateProductViews();
  return {};
}

export async function setProductStatusAction(productIds: string[], status: ProductStatus): Promise<ProductActionResult> {
  const guard = await requirePermission("products");
  if (guard) return guard;

  if (productIds.length === 0) return {};
  await db.update(productMeta).set({ status }).where(inArray(productMeta.productId, productIds));

  const actor = await getAdminActorName();
  await logActivity(
    "product",
    productIds.length === 1
      ? `Product status set to ${status}`
      : `${productIds.length} products set to ${status}`,
    actor
  );
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
  await db.update(productMeta).set({ visibility }).where(inArray(productMeta.productId, productIds));

  const actor = await getAdminActorName();
  await logActivity(
    "product",
    productIds.length === 1
      ? `Product visibility set to ${visibility}`
      : `${productIds.length} products set to ${visibility}`,
    actor
  );
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
  await db.delete(inventory).where(inArray(inventory.productId, productIds));
  await db.delete(productMeta).where(inArray(productMeta.productId, productIds));
  await db.delete(products).where(inArray(products.id, productIds));

  const actor = await getAdminActorName();
  await logActivity(
    "product",
    productIds.length === 1 ? "Product deleted" : `${productIds.length} products deleted`,
    actor
  );
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
