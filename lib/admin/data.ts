import { PRODUCTS } from "@/app/data/products";
import { BRANDS } from "@/app/data/brands";
import { CATEGORIES } from "@/app/data/categories";
import { SUPPLIERS } from "@/app/data/admin/suppliers";
import { PRODUCT_META } from "@/app/data/admin/product-meta";
import { CUSTOMERS } from "@/app/data/admin/customers";
import { ORDERS } from "@/app/data/admin/orders";
import { PAYMENTS, DISPUTES, PAYOUTS } from "@/app/data/admin/payments";
import { INVENTORY } from "@/app/data/admin/inventory";
import {
  IMPORT_QUEUE,
  IMPORT_HISTORY,
  IMPORT_ERRORS,
  FIELD_MAPPINGS,
  SUPPLIER_LOGS,
} from "@/app/data/admin/imports";
import { ACTIVITY, ANNOUNCEMENTS } from "@/app/data/admin/activity";
import { SYSTEM_COMPONENTS } from "@/app/data/admin/system";
import { CJ_DISPUTES } from "@/app/data/admin/cj-disputes";
import { CJ_SHIPPING_LINES, CJ_INTEGRATION_SETTINGS, CJ_SOURCING_REQUESTS } from "@/lib/admin/cj";
import type { Product, Brand } from "@/lib/types";
import type { AdminProductMeta, Customer, Supplier } from "@/lib/admin/types";
import type { CjShippingLine } from "@/lib/admin/cj-types";

const shippingLineById = new Map(CJ_SHIPPING_LINES.map((l) => [l.id, l]));
export function getCjShippingLine(id: string | undefined): CjShippingLine | undefined {
  return id ? shippingLineById.get(id) : undefined;
}
export const CJ_BRAND_NAME = "CJdropshipping";

// "Today" for the mock dataset — matches the generator's NOW.
export const ADMIN_NOW = new Date("2026-07-19T09:00:00-04:00").getTime();

const productById = new Map(PRODUCTS.map((p) => [p.id, p]));
const brandById = new Map(BRANDS.map((b) => [b.id, b]));
const metaByProductId = new Map(PRODUCT_META.map((m) => [m.productId, m]));
const customerById = new Map(CUSTOMERS.map((c) => [c.id, c]));
const supplierById = new Map(SUPPLIERS.map((s) => [s.id, s]));
const categoryNameBySlug = new Map(CATEGORIES.map((c) => [c.slug, c.name]));

export function getProduct(id: string): Product | undefined {
  return productById.get(id);
}
export function getBrand(id: string): Brand | undefined {
  return brandById.get(id);
}
export function getProductMeta(productId: string): AdminProductMeta | undefined {
  return metaByProductId.get(productId);
}
export function getCustomer(id: string): Customer | undefined {
  return customerById.get(id);
}
export function getSupplier(id: string | undefined): Supplier | undefined {
  return id ? supplierById.get(id) : undefined;
}
export function getTopCategoryName(slug: string): string {
  return categoryNameBySlug.get(slug) ?? slug;
}
export function getOrdersForCustomer(customerId: string) {
  return ORDERS.filter((o) => o.customerId === customerId).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
}

export interface AdminProductRow {
  product: Product;
  meta: AdminProductMeta;
  brandName: string;
  supplierName: string;
  categoryName: string;
  margin: number;
  marginPercent: number;
}

let adminProductRowsCache: AdminProductRow[] | null = null;

export function getAdminProductRows(): AdminProductRow[] {
  if (adminProductRowsCache) return adminProductRowsCache;
  adminProductRowsCache = PRODUCTS.map((product) => {
    const meta = metaByProductId.get(product.id)!;
    // True margin for CJ-sourced items must subtract the per-order CJ
    // shipping fee too, not just product cost — see lib/admin/cj-types.ts.
    const totalCost = meta.cost + (meta.source === "cj" ? meta.cjShippingFee ?? 0 : 0);
    const margin = Math.round((product.price - totalCost) * 100) / 100;
    const supplierName = meta.source === "cj" ? CJ_BRAND_NAME : supplierById.get(meta.supplierId ?? "")?.name ?? "—";
    return {
      product,
      meta,
      brandName: brandById.get(product.brandId)?.name ?? product.brandId,
      supplierName,
      categoryName: categoryNameBySlug.get(product.categorySlugPath[0]) ?? product.categorySlugPath[0],
      margin,
      marginPercent: Math.round((margin / product.price) * 1000) / 10,
    };
  });
  return adminProductRowsCache;
}

/**
 * Lean variant for the client-side products table: drops `description` and
 * `features` and keeps only the first image. Those fields aren't rendered by
 * any table column, but as full `Product` objects they'd otherwise roughly
 * double the RSC payload shipped to the client across 2,800+ rows for no
 * benefit — trim here rather than shipping the full catalog to the browser.
 */
export function getAdminProductTableRows(): AdminProductRow[] {
  return getAdminProductRows().map((row) => ({
    ...row,
    product: { ...row.product, images: [row.product.images[0]], features: [] },
  }));
}

export {
  PRODUCTS,
  BRANDS,
  CATEGORIES,
  SUPPLIERS,
  PRODUCT_META,
  CUSTOMERS,
  ORDERS,
  PAYMENTS,
  DISPUTES,
  PAYOUTS,
  INVENTORY,
  IMPORT_QUEUE,
  IMPORT_HISTORY,
  IMPORT_ERRORS,
  FIELD_MAPPINGS,
  SUPPLIER_LOGS,
  ACTIVITY,
  ANNOUNCEMENTS,
  SYSTEM_COMPONENTS,
  CJ_DISPUTES,
  CJ_SHIPPING_LINES,
  CJ_INTEGRATION_SETTINGS,
  CJ_SOURCING_REQUESTS,
};
