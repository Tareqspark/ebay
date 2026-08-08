import "server-only";
import { and, asc, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { products, productMeta, brands, suppliers } from "@/db/schema";
import { toDollars } from "@/lib/money";
import { CJ_BRAND_NAME } from "@/lib/admin/constants";
import type { AdminProductRow } from "@/lib/admin/data";

/**
 * Server-side filter, sort and paging for the admin Products table.
 *
 * The table previously received all ~11.7k rows and did this work in the
 * browser, which meant every visit downloaded and parsed the whole catalog
 * before rendering 25 of them. Everything here happens in SQL so a page
 * costs one page's worth of data.
 */
export interface ProductQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  visibility?: string;
  category?: string;
  source?: string;
  savedView?: string;
  sort?: string;
  dir?: "asc" | "desc";
}

export interface ProductQueryResult {
  rows: AdminProductRow[];
  total: number;
  page: number;
  pageCount: number;
}

/** Margin as a fraction of price, computed in SQL so the low-margin view can be a WHERE clause rather than a post-filter. */
const marginFraction = sql`((${products.priceCents} - ${productMeta.costCents}) / NULLIF(${products.priceCents}, 0))`;

function buildConditions(q: ProductQuery): SQL[] {
  const conditions: SQL[] = [];

  if (q.search?.trim()) {
    const term = `%${q.search.trim()}%`;
    // Title and brand cover what someone actually types; category and
    // supplier have their own filters.
    conditions.push(or(like(products.title, term), like(brands.name, term))!);
  }
  if (q.status && q.status !== "all") conditions.push(eq(productMeta.status, q.status as "active"));
  if (q.visibility && q.visibility !== "all") conditions.push(eq(productMeta.visibility, q.visibility as "visible"));
  if (q.source && q.source !== "all") conditions.push(eq(productMeta.source, q.source as "self"));
  if (q.category && q.category !== "all") {
    conditions.push(sql`json_unquote(json_extract(${products.categorySlugPath}, '$[0]')) = ${q.category}`);
  }

  switch (q.savedView) {
    case "low-margin":
      conditions.push(sql`${marginFraction} < 0.15`);
      break;
    case "out-of-stock":
      conditions.push(eq(products.stock, 0));
      break;
    case "needs-review":
      conditions.push(eq(productMeta.needsReview, true));
      break;
    case "active-visible":
      conditions.push(eq(productMeta.status, "active"));
      conditions.push(eq(productMeta.visibility, "visible"));
      break;
  }
  return conditions;
}

function orderBy(sort: string | undefined, dir: "asc" | "desc") {
  const d = dir === "asc" ? asc : desc;
  switch (sort) {
    case "name":
      return d(products.title);
    case "price":
      return d(products.priceCents);
    case "cost":
      return d(productMeta.costCents);
    case "inventory":
      return d(products.stock);
    case "margin":
      return dir === "asc" ? asc(marginFraction) : desc(marginFraction);
    case "updated":
      return d(productMeta.lastUpdatedAt);
    default:
      // Newest first, matching what the unpaginated table settled on: a
      // product created a minute ago must not land on page 400.
      return desc(productMeta.importedAt);
  }
}

export async function queryAdminProducts(q: ProductQuery): Promise<ProductQueryResult> {
  // Capped generously rather than tightly: the CSV export legitimately asks
  // for every matching row, and a bounded ceiling still prevents a runaway query.
  const pageSize = Math.min(Math.max(q.pageSize || 25, 1), 20000);
  const page = Math.max(q.page || 1, 1);
  const conditions = buildConditions(q);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .innerJoin(productMeta, eq(productMeta.productId, products.id))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .where(where);
  const total = Number(countRow?.count ?? 0);

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      brandId: products.brandId,
      brandName: brands.name,
      priceCents: products.priceCents,
      images: products.images,
      categorySlugPath: products.categorySlugPath,
      stock: products.stock,
      ratingValue: products.ratingValue,
      ratingCount: products.ratingCount,
      freeShipping: products.freeShipping,
      costCents: productMeta.costCents,
      source: productMeta.source,
      status: productMeta.status,
      visibility: productMeta.visibility,
      needsReview: productMeta.needsReview,
      importedAt: productMeta.importedAt,
      lastUpdatedAt: productMeta.lastUpdatedAt,
      supplierId: productMeta.supplierId,
      supplierName: suppliers.name,
      cjShippingFeeCents: productMeta.cjShippingFeeCents,
      cjProductId: productMeta.cjProductId,
    })
    .from(products)
    .innerJoin(productMeta, eq(productMeta.productId, products.id))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(suppliers, eq(suppliers.id, productMeta.supplierId))
    .where(where)
    .orderBy(orderBy(q.sort, q.dir ?? "desc"))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    rows: rows.map((r) => {
      const price = toDollars(r.priceCents);
      const totalCost = toDollars(r.costCents) + (r.source === "cj" ? toDollars(r.cjShippingFeeCents ?? 0) : 0);
      const margin = Math.round((price - totalCost) * 100) / 100;
      return {
        product: {
          id: r.id,
          slug: r.slug,
          title: r.title,
          brandId: r.brandId,
          brandName: r.brandName ?? r.brandId,
          price,
          currency: "USD",
          // Only the thumbnail the table renders, and no description: the
          // detail panel refetches the full product when it opens.
          images: [r.images[0]],
          review: { rating: Number(r.ratingValue), count: r.ratingCount },
          categorySlugPath: r.categorySlugPath,
          isNewArrival: false,
          isBestSeller: false,
          isTrending: false,
          isFlashSale: false,
          isDeal: false,
          isFeaturedDeal: false,
          isWeeklyTopDeal: false,
          freeShipping: r.freeShipping,
          stock: r.stock,
          description: "",
          features: [],
        },
        meta: {
          productId: r.id,
          source: r.source,
          cost: toDollars(r.costCents),
          supplierId: r.supplierId ?? undefined,
          status: r.status,
          visibility: r.visibility,
          needsReview: r.needsReview,
          importedAt: r.importedAt.toISOString(),
          lastUpdatedAt: r.lastUpdatedAt.toISOString(),
          cjProductId: r.cjProductId ?? undefined,
          cjShippingFee: r.cjShippingFeeCents != null ? toDollars(r.cjShippingFeeCents) : undefined,
        },
        brandName: r.brandName ?? r.brandId,
        supplierName: r.source === "cj" ? CJ_BRAND_NAME : r.supplierName ?? "—",
        categoryName: r.categorySlugPath[0] ?? "",
        margin,
        marginPercent: price > 0 ? Math.round((margin / price) * 1000) / 10 : 0,
      } as AdminProductRow;
    }),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
