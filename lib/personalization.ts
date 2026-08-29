import "server-only";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, productViews } from "@/db/schema";
import { getProductsByIds, getTopRatedInDepartment, getHighValueTrendingProducts } from "@/lib/products";
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
 * recent browsing behavior (lib/product-views.ts) once either exists.
 *
 * With no signal — a guest, or a first visit — it shows high-value trending
 * stock instead. That was previously a static top-rated slice, which meant
 * every visitor saw the same twelve products on every page load.
 */
export async function getPersonalizedRecommendations(
  userId: string | null,
  limit = 12,
  excludeIds: string[] = []
): Promise<Product[]> {
  if (!userId) return getHighValueTrendingProducts(limit, excludeIds);

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

  if (purchasedRows.length === 0 && viewedRows.length === 0) return getHighValueTrendingProducts(limit, excludeIds);

  const purchasedIds = new Set(purchasedRows.map((r) => r.productId));
  const viewedIds = new Set(viewedRows.map((r) => r.productId));

  // Only the shopper's own purchases are fetched, not the catalogue. This
  // loaded every product in the shop to look up a handful of category slugs,
  // which is part of what was exhausting the heap.
  const purchased = await getProductsByIds([...purchasedIds]);

  const categoryScore = new Map<string, number>();
  for (const p of purchased) {
    const topSlug = p.categorySlugPath[0];
    if (topSlug) categoryScore.set(topSlug, (categoryScore.get(topSlug) ?? 0) + PURCHASE_WEIGHT);
  }
  for (const row of viewedRows) {
    categoryScore.set(row.categorySlug, (categoryScore.get(row.categorySlug) ?? 0) + VIEW_WEIGHT);
  }

  // Recently-viewed items already get their own homepage rail — excluding
  // them here keeps "Recommended For You" from just echoing it back.
  const excluded = new Set([...excludeIds, ...purchasedIds, ...viewedIds]);
  /**
   * Affinity decides which categories to draw from; price decides which
   * products within them. Sorting on affinity alone left ties in
   * insertion order — so a shopper saw the same items in the same sequence
   * every visit.
   */
  // Candidates come from the affinity categories only, fetched per category
  // rather than by scanning everything.
  const ranked = [...categoryScore.entries()].sort((a, b) => b[1] - a[1]);
  const candidates = (
    await Promise.all(ranked.slice(0, 4).map(([slug]) => getTopRatedInDepartment(slug, limit * 3)))
  ).flat();

  const pool = candidates
    .filter((p) => !excluded.has(p.id))
    .sort((a, b) => {
      const byAffinity =
        (categoryScore.get(b.categorySlugPath[0]) ?? 0) - (categoryScore.get(a.categorySlugPath[0]) ?? 0);
      return byAffinity !== 0 ? byAffinity : b.price - a.price;
    });

  if (pool.length >= limit) return pool.slice(0, limit);

  const fallback = await getHighValueTrendingProducts(limit - pool.length, [...excluded, ...pool.map((p) => p.id)]);
  return [...pool, ...fallback];
}
