"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productMeta, inventory } from "@/db/schema";
import { toCents } from "@/lib/money";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { ProductStatus, ProductVisibility } from "@/lib/admin/types";

export interface ProductActionResult {
  error?: string;
}

function revalidateProductViews() {
  revalidatePath("/admin/products");
}

export async function updateProductPriceAction(productId: string, price: number): Promise<ProductActionResult> {
  if (!Number.isFinite(price) || price < 0) return { error: "Price can't be negative" };
  await db.update(products).set({ priceCents: toCents(price) }).where(eq(products.id, productId));
  revalidateProductViews();
  return {};
}

export async function updateProductCostAction(productId: string, cost: number): Promise<ProductActionResult> {
  if (!Number.isFinite(cost) || cost < 0) return { error: "Cost can't be negative" };
  await db.update(productMeta).set({ costCents: toCents(cost) }).where(eq(productMeta.productId, productId));
  revalidateProductViews();
  return {};
}

export async function setProductStatusAction(productIds: string[], status: ProductStatus): Promise<ProductActionResult> {
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
