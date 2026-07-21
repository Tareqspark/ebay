import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { getAllProducts, getRecommendedProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * Ranks by the shopper's own purchase-history categories once real orders
 * exist; falls back to the static top-rated heuristic for guests or
 * first-time buyers with no history yet.
 */
export async function getPersonalizedRecommendations(
  userId: string | null,
  limit = 12,
  excludeIds: string[] = []
): Promise<Product[]> {
  if (!userId) return getRecommendedProducts(limit, excludeIds);

  const purchasedRows = await db
    .select({ productId: orderItems.productId })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orders.userId, userId));

  if (purchasedRows.length === 0) return getRecommendedProducts(limit, excludeIds);

  const purchasedIds = new Set(purchasedRows.map((r) => r.productId));
  const all = await getAllProducts();
  const productById = new Map(all.map((p) => [p.id, p]));

  const categoryCounts = new Map<string, number>();
  for (const id of purchasedIds) {
    const topSlug = productById.get(id)?.categorySlugPath[0];
    if (topSlug) categoryCounts.set(topSlug, (categoryCounts.get(topSlug) ?? 0) + 1);
  }
  const preferredCategories = new Set([...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([slug]) => slug));

  const excluded = new Set([...excludeIds, ...purchasedIds]);
  const pool = all.filter(
    (p) => !excluded.has(p.id) && p.review.rating >= 4.0 && preferredCategories.has(p.categorySlugPath[0])
  );

  if (pool.length >= limit) return pool.slice(0, limit);

  const fallback = await getRecommendedProducts(limit - pool.length, [...excluded, ...pool.map((p) => p.id)]);
  return [...pool, ...fallback];
}
