import "server-only";
import { cache } from "react";
import Fuse from "fuse.js";
import { eq, inArray, desc, gt, gte, lte, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { products as productsTable, orderItems as orderItemsTable, orders as ordersTable } from "@/db/schema";
import { getAllBrands, getBrandById } from "@/lib/brands";
import { toDollars } from "@/lib/money";
import type { Brand, Product } from "@/lib/types";
import { sortProducts, filterProducts, getPriceBounds } from "@/lib/products-client";
import type { SortKey, ProductFilters } from "@/lib/products-client";

export { sortProducts, filterProducts, getPriceBounds };
export type { SortKey, ProductFilters };

type ProductRow = typeof productsTable.$inferSelect;

/** Cached per request (via getAllBrands()'s own cache()) — cheap to call from every fetch function below. */
async function getBrandNameById(): Promise<Map<string, string>> {
  const brands = await getAllBrands();
  return new Map(brands.map((b) => [b.id, b.name]));
}

function toProduct(row: ProductRow, brandNameById: Map<string, string>): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brandId: row.brandId,
    brandName: brandNameById.get(row.brandId) ?? row.brandId,
    price: toDollars(row.priceCents),
    originalPrice: row.originalPriceCents != null ? toDollars(row.originalPriceCents) : undefined,
    currency: "USD",
    images: row.images,
    review: { rating: Number(row.ratingValue), count: row.ratingCount },
    categorySlugPath: row.categorySlugPath,
    isNewArrival: row.isNewArrival,
    isBestSeller: row.isBestSeller,
    isTrending: row.isTrending,
    isFlashSale: row.isFlashSale,
    isDeal: row.isDeal,
    isFeaturedDeal: row.isFeaturedDeal,
    isWeeklyTopDeal: row.isWeeklyTopDeal,
    flashSaleEndsAt: row.flashSaleEndsAt ? row.flashSaleEndsAt.toISOString() : undefined,
    freeShipping: row.freeShipping,
    stock: row.stock,
    description: row.description,
    features: row.features,
  };
}

/** All 2,800+ products, cached once per request — every fetch helper below filters this in memory rather than re-querying, since the whole catalog is a fast, cacheable read compared to the many small selective queries the storefront would otherwise issue per request. */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const [rows, brandNameById] = await Promise.all([db.select().from(productsTable), getBrandNameById()]);
  return rows.map((r) => toProduct(r, brandNameById));
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const [row] = await db.select().from(productsTable).where(eq(productsTable.slug, slug)).limit(1);
  if (!row) return undefined;
  return toProduct(row, await getBrandNameById());
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(inArray(productsTable.id, ids)),
    getBrandNameById(),
  ]);
  const byId = new Map(rows.map((r) => [r.id, toProduct(r, brandNameById)]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

/**
 * Typo-tolerant, ranked full-text search over the whole catalog — an
 * in-process Fuse.js index built fresh from getAllProducts() on each call
 * (that call is itself request-cached, so this is one extra pass over an
 * already-cheap in-memory array, not a new DB round trip). Field weights
 * mean a title match always outranks a description-only match; the
 * threshold is loose enough to survive a one- or two-character typo
 * without turning into a fuzzy-anything-goes match.
 */
const getProductSearchIndex = cache(async (): Promise<Fuse<Product>> => {
  const products = await getAllProducts();
  return new Fuse(products, {
    keys: [
      { name: "title", weight: 0.5 },
      { name: "brandName", weight: 0.25 },
      { name: "description", weight: 0.15 },
      { name: "features", weight: 0.1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
});

export async function searchProducts(query: string, limit = 24): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const index = await getProductSearchIndex();
  return index
    .search(trimmed, { limit })
    .map((result) => result.item);
}

/** Products whose category path starts with the given slug segments. */
export async function getProductsByCategoryPath(segments: string[]): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => segments.every((seg, i) => p.categorySlugPath[i] === seg));
}

export async function getDealsProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isDeal, true)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

export async function getFlashSaleProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isFlashSale, true)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

export async function getTrendingProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isTrending, true)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

export async function getNewArrivalProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isNewArrival, true)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

export async function getBestSellerProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isBestSeller, true)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/** Ranked by real sales — SUM(order_items.quantity) across paid orders, not a seeded flag like the other rails above. Empty until real orders exist. */
export async function getTopSellingProducts(limit = 12): Promise<Product[]> {
  const rows = await db
    .select({ productId: orderItemsTable.productId, totalSold: sql<number>`sum(${orderItemsTable.quantity})`.as("total_sold") })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
    .where(eq(ordersTable.paymentStatus, "paid"))
    .groupBy(orderItemsTable.productId)
    .orderBy(desc(sql`total_sold`))
    .limit(limit);
  return getProductsByIds(rows.map((r) => r.productId));
}

/** Ranked by ratingCount — the review-count field already shown on every product card, not the (currently empty) reviews table. */
export async function getMostReviewedProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(gt(productsTable.ratingCount, 0)).orderBy(desc(productsTable.ratingCount)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/** Admin-curated (see lib/admin/homepage-deals-actions.ts) — hand-picked, not computed. */
export async function getFeaturedDealProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isFeaturedDeal, true)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/** Admin-curated (see lib/admin/homepage-deals-actions.ts) — hand-picked, not computed. */
export async function getWeeklyTopDealProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isWeeklyTopDeal, true)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

export interface CollectionRule {
  topCategorySlug?: string | null;
  minPriceCents?: number | null;
  maxPriceCents?: number | null;
  minRating?: string | null;
}

/** Real-time membership for an "automated" collection (see lib/collections.ts) — every condition present is ANDed, so a product added to the catalog tomorrow that matches shows up here without anyone re-curating anything. */
export async function getProductsMatchingRule(rule: CollectionRule, limit = 60): Promise<Product[]> {
  const conditions = [];
  if (rule.topCategorySlug) {
    conditions.push(sql`json_unquote(json_extract(${productsTable.categorySlugPath}, '$[0]')) = ${rule.topCategorySlug}`);
  }
  if (rule.minPriceCents != null) conditions.push(gte(productsTable.priceCents, rule.minPriceCents));
  if (rule.maxPriceCents != null) conditions.push(lte(productsTable.priceCents, rule.maxPriceCents));
  if (rule.minRating != null) conditions.push(gte(productsTable.ratingValue, rule.minRating));
  if (conditions.length === 0) return [];

  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(and(...conditions)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/** Same conditions as getProductsMatchingRule, but a plain count — powers the admin collections list's "Products" column without fetching/mapping full rows just to count them. */
export async function countProductsMatchingRule(rule: CollectionRule): Promise<number> {
  const conditions = [];
  if (rule.topCategorySlug) {
    conditions.push(sql`json_unquote(json_extract(${productsTable.categorySlugPath}, '$[0]')) = ${rule.topCategorySlug}`);
  }
  if (rule.minPriceCents != null) conditions.push(gte(productsTable.priceCents, rule.minPriceCents));
  if (rule.maxPriceCents != null) conditions.push(lte(productsTable.priceCents, rule.maxPriceCents));
  if (rule.minRating != null) conditions.push(gte(productsTable.ratingValue, rule.minRating));
  if (conditions.length === 0) return 0;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(and(...conditions));
  return count;
}

export async function getRecommendedProducts(limit = 12, excludeIds: string[] = []): Promise<Product[]> {
  const excluded = new Set(excludeIds);
  const all = await getAllProducts();
  return all.filter((p) => !excluded.has(p.id) && p.review.rating >= 4.2).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const [topSlug, childSlug] = product.categorySlugPath;
  const all = await getAllProducts();
  return all
    .filter((p) => p.id !== product.id && p.categorySlugPath[0] === topSlug && p.categorySlugPath[1] === childSlug)
    .slice(0, limit);
}

export async function getBrandsInProducts(products: Product[]): Promise<Brand[]> {
  const seen = new Set<string>();
  const brands: Brand[] = [];
  for (const p of products) {
    if (seen.has(p.brandId)) continue;
    seen.add(p.brandId);
    const brand = await getBrandById(p.brandId);
    if (brand) brands.push(brand);
  }
  return brands.sort((a, b) => a.name.localeCompare(b.name));
}
