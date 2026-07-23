import "server-only";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, productViews } from "@/db/schema";
import { getAllProducts, getRecommendedProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

// A completed purchase is a much stronger preference signal than a page
// view — weighted accordingly when blending the two into one category
// affinity score. Browsing history is capped to the most recent rows
// (an unbounded append-only log otherwise) so a shopper's last few minutes
// of browsing can't get permanently diluted by months of old views, and
// so a single stale interest from a year ago doesn't outweigh what
// they're actually looking at now.
const PURCHASE_WEIGHT = 3;
const VIEW_WEIGHT = 1;
const RECENT_VIEWS_LIMIT = 50;

/**
 * Ranks by a blend of the shopper's purchase-history categories and their
 * recent browsing behavior (lib/product-views.ts) once either exists;
 * falls back to the static top-rated heuristic for guests or first-time
 * visitors with no signal yet.
 */
export async function getPersonalizedRecommendations(
  userId: string | null,
  limit = 12,
  excludeIds: string[] = []
): Promise<Product[]> {
  if (!userId) return getRecommendedProducts(limit, excludeIds);

  const [purchasedRows, viewedRows] = await Promise.all([
    db
      .select({ productId: orderItems.productId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orders.userId, userId)),
    db
      .select({ productId: productViews.productId, categorySlug: productViews.categorySlug })
      .from(productViews)
      .where(eq(productViews.userId, userId))
      .orderBy(desc(productViews.viewedAt))
      .limit(RECENT_VIEWS_LIMIT),
  ]);

  if (purchasedRows.length === 0 && viewedRows.length === 0) return getRecommendedProducts(limit, excludeIds);

  const purchasedIds = new Set(purchasedRows.map((r) => r.productId));
  const viewedIds = new Set(viewedRows.map((r) => r.productId));
  const all = await getAllProducts();
  const productById = new Map(all.map((p) => [p.id, p]));

  const categoryScore = new Map<string, number>();
  for (const id of purchasedIds) {
    const topSlug = productById.get(id)?.categorySlugPath[0];
    if (topSlug) categoryScore.set(topSlug, (categoryScore.get(topSlug) ?? 0) + PURCHASE_WEIGHT);
  }
  for (const row of viewedRows) {
    categoryScore.set(row.categorySlug, (categoryScore.get(row.categorySlug) ?? 0) + VIEW_WEIGHT);
  }

  // Recently-viewed items already get their own homepage rail — excluding
  // them here keeps "Recommended For You" from just echoing it back.
  const excluded = new Set([...excludeIds, ...purchasedIds, ...viewedIds]);
  const pool = all
    .filter((p) => !excluded.has(p.id) && p.review.rating >= 4.0 && categoryScore.has(p.categorySlugPath[0]))
    .sort((a, b) => (categoryScore.get(b.categorySlugPath[0]) ?? 0) - (categoryScore.get(a.categorySlugPath[0]) ?? 0));

  if (pool.length >= limit) return pool.slice(0, limit);

  const fallback = await getRecommendedProducts(limit - pool.length, [...excluded, ...pool.map((p) => p.id)]);
  return [...pool, ...fallback];
}
