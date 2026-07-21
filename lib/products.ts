import "server-only";
import { cache } from "react";
import { eq, inArray, like } from "drizzle-orm";
import { db } from "@/db";
import { products as productsTable } from "@/db/schema";
import { getAllBrands, getBrandById } from "@/lib/brands";
import { toDollars } from "@/lib/money";
import type { Brand, Product } from "@/lib/types";

export type SortKey = "relevance" | "price-asc" | "price-desc" | "rating" | "newest";

export interface ProductFilters {
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

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

export async function searchProducts(query: string, limit = 24): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(like(productsTable.title, `%${trimmed}%`)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
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

export function sortProducts(products: Product[], sortKey: SortKey): Product[] {
  const sorted = [...products];
  switch (sortKey) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.review.rating - a.review.rating);
    case "newest":
      return sorted.sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival));
    default:
      return sorted;
  }
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((p) => {
    if (filters.brandIds?.length && !filters.brandIds.includes(p.brandId)) return false;
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
    if (filters.minRating !== undefined && p.review.rating < filters.minRating) return false;
    return true;
  });
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

export function getPriceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  let min = Infinity;
  let max = 0;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min: Math.floor(min), max: Math.ceil(max) };
}
