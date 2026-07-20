import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CjCatalogItem } from "@/lib/admin/cj-types";
import type { CjStockStatus, CjWarehouse } from "@/lib/admin/types";

/**
 * Server-only access to the CJ catalog. Loaded from a plain JSON file under
 * /data (outside app/), read via fs rather than a JS import, and cached in
 * module scope after the first read — this keeps a 50k-item catalog (~17MB)
 * out of any client bundle and out of the RSC payload; only one page of
 * results at a time ever leaves the server (see app/api/admin/cj-catalog).
 *
 * This module must never be imported from a "use client" file.
 */
let cache: CjCatalogItem[] | null = null;

function loadCatalog(): CjCatalogItem[] {
  if (cache) return cache;
  const path = join(process.cwd(), "data", "cj-catalog.json");
  const raw = readFileSync(path, "utf-8");
  cache = JSON.parse(raw) as CjCatalogItem[];
  return cache;
}

export interface CjCatalogQuery {
  q?: string;
  category?: string;
  warehouse?: CjWarehouse;
  stockStatus?: CjStockStatus;
  importedOnly?: boolean;
  hideImported?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CjCatalogResult {
  items: CjCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function searchCjCatalog(query: CjCatalogQuery): CjCatalogResult {
  const all = loadCatalog();
  const q = query.q?.trim().toLowerCase();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25));

  const filtered = all.filter((item) => {
    if (q && !item.title.toLowerCase().includes(q) && !item.cjProductId.toLowerCase().includes(q)) return false;
    if (query.category && item.categorySlug !== query.category) return false;
    if (query.warehouse && item.sourceWarehouse !== query.warehouse) return false;
    if (query.stockStatus && item.stockStatus !== query.stockStatus) return false;
    if (query.importedOnly && !item.imported) return false;
    if (query.hideImported && item.imported) return false;
    return true;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, total, page, pageSize, pageCount };
}

export function getCjCatalogTotal(): number {
  return loadCatalog().length;
}

export function getCjCatalogItemById(id: string): CjCatalogItem | undefined {
  return loadCatalog().find((item) => item.id === id);
}
