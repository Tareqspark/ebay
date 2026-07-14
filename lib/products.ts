import { PRODUCTS } from "@/app/data/products";
import { getBrandById } from "@/app/data/brands";
import type { Brand, Product } from "@/lib/types";

export type SortKey = "relevance" | "price-asc" | "price-desc" | "rating" | "newest";

export interface ProductFilters {
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByIds(ids: string[]): Product[] {
  const idSet = new Set(ids);
  const byId = new Map(PRODUCTS.filter((p) => idSet.has(p.id)).map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

export function searchProducts(query: string, limit = 24): Product[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return PRODUCTS.filter((p) => p.title.toLowerCase().includes(trimmed)).slice(0, limit);
}

/** Products whose category path starts with the given slug segments. */
export function getProductsByCategoryPath(segments: string[]): Product[] {
  return PRODUCTS.filter((p) =>
    segments.every((seg, i) => p.categorySlugPath[i] === seg)
  );
}

export function getDealsProducts(limit = 12): Product[] {
  return PRODUCTS.filter((p) => p.isDeal).slice(0, limit);
}

export function getFlashSaleProducts(limit = 12): Product[] {
  return PRODUCTS.filter((p) => p.isFlashSale).slice(0, limit);
}

export function getTrendingProducts(limit = 12): Product[] {
  return PRODUCTS.filter((p) => p.isTrending).slice(0, limit);
}

export function getNewArrivalProducts(limit = 12): Product[] {
  return PRODUCTS.filter((p) => p.isNewArrival).slice(0, limit);
}

export function getBestSellerProducts(limit = 12): Product[] {
  return PRODUCTS.filter((p) => p.isBestSeller).slice(0, limit);
}

export function getRecommendedProducts(limit = 12, excludeIds: string[] = []): Product[] {
  const excluded = new Set(excludeIds);
  const pool = PRODUCTS.filter((p) => !excluded.has(p.id) && p.review.rating >= 4.2);
  return pool.slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 8): Product[] {
  const [topSlug, childSlug] = product.categorySlugPath;
  return PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      p.categorySlugPath[0] === topSlug &&
      p.categorySlugPath[1] === childSlug
  ).slice(0, limit);
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

export function getBrandsInProducts(products: Product[]): Brand[] {
  const seen = new Set<string>();
  const brands: Brand[] = [];
  for (const p of products) {
    if (seen.has(p.brandId)) continue;
    seen.add(p.brandId);
    const brand = getBrandById(p.brandId);
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
