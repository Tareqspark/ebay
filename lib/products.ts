import "server-only";
import { cache } from "react";
import Fuse from "fuse.js";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products as productsTable } from "@/db/schema";
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
