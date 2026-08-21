import type { Product } from "@/lib/types";

// Pure, client-safe product helpers with no DB/"server-only" dependency —
// import from here (not lib/products) in "use client" components.
// lib/products.ts re-exports these for server-side callers.

export type SortKey = "relevance" | "price-asc" | "price-desc" | "rating" | "newest";

export interface ProductFilters {
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
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

/**
 * Always returns max > min, strictly — the price Slider that consumes this
 * (components/product/product-explorer.tsx) errors otherwise. Both an empty
 * product list and a list where every product shares the same price (a
 * single-product category, common in a real, unevenly-sized catalog) can
 * degenerate to min === max after flooring/ceiling; both are widened by 1
 * rather than left equal.
 */
export function getPriceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 1 };
  let min = Infinity;
  let max = 0;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  const flooredMin = Math.floor(min);
  const ceiledMax = Math.ceil(max);
  return { min: flooredMin, max: ceiledMax > flooredMin ? ceiledMax : flooredMin + 1 };
}

/** Filter state as it travels in the URL. Shared by every page that renders ProductExplorer. */
export interface ExplorerParams {
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortKey;
  page?: number;
}

const SORT_KEYS: SortKey[] = ["relevance", "price-asc", "price-desc", "rating", "newest"];

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = one(v);
  if (s === undefined || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Reads filter state out of a URL query.
 *
 * Everything is validated rather than trusted: these values reach SQL as
 * LIMIT/OFFSET and comparison operands, and an unbounded `page` is a cheap way
 * to make the database scan a whole table.
 */
export function parseExplorerParams(sp: Record<string, string | string[] | undefined>): ExplorerParams {
  const sortRaw = one(sp.sort) as SortKey | undefined;
  const page = num(sp.page);
  const rating = num(sp.rating);
  const brands = one(sp.brands);

  return {
    brandIds: brands ? brands.split(",").filter(Boolean).slice(0, 50) : undefined,
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    minRating: rating !== undefined && rating > 0 && rating <= 5 ? rating : undefined,
    sort: sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : undefined,
    page: page !== undefined && page >= 1 ? Math.min(Math.floor(page), 10_000) : undefined,
  };
}
