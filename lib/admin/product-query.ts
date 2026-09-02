import "server-only";
import { and, eq, inArray, like, or, sql, type SQL } from "drizzle-orm";
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

/**
 * Ordering for the grouped query, which must be aggregate-only.
 *
 * MySQL runs with ONLY_FULL_GROUP_BY, so a bare column in ORDER BY beside a
 * GROUP BY is rejected outright — every sort here has to pick the aggregate
 * that means the right thing for a whole product rather than for one of its
 * colours. Cheapest ascending, dearest descending, stock summed across the
 * group, and newest by the highest id, product ids being ULIDs.
 *
 * Every ordering ends in the group id. Without a unique tiebreaker MySQL can
 * order equal values differently between pages, which silently repeats some
 * products and skips others across OFFSET boundaries.
 */
function groupedOrderBy(sort: string | undefined, dir: "asc" | "desc") {
  const tiebreak = sql`${products.variantGroupId} asc`;
  const d = (expr: SQL) => (dir === "asc" ? sql`${expr} asc` : sql`${expr} desc`);
  switch (sort) {
    case "name":
      return [d(sql`min(${products.title})`), tiebreak];
    case "price":
      return [dir === "asc" ? sql`min(${products.priceCents}) asc` : sql`max(${products.priceCents}) desc`, tiebreak];
    case "cost":
      return [d(sql`min(${productMeta.costCents})`), tiebreak];
    case "inventory":
      return [d(sql`sum(${products.stock})`), tiebreak];
    case "margin":
      return [d(sql`min(${marginFraction})`), tiebreak];
    case "updated":
      return [d(sql`max(${productMeta.lastUpdatedAt})`), tiebreak];
    default:
      return [sql`max(${products.id}) desc`, tiebreak];
  }
}



export async function queryAdminProducts(q: ProductQuery): Promise<ProductQueryResult> {
  // Capped generously rather than tightly: the CSV export legitimately asks
  // for every matching row, and a bounded ceiling still prevents a runaway query.
  const pageSize = Math.min(Math.max(q.pageSize || 25, 1), 20000);
  const page = Math.max(q.page || 1, 1);
  const conditions = buildConditions(q);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  /**
   * The rollup only joins when a filter actually needs the joined table.
   *
   * Grouping 148,039 rows costs about 300ms off a covering index and about
   * 4 seconds once product_meta is joined in. The default admin view filters on
   * neither table, so paying for those joins on every page load bought nothing.
   */
  const needsMeta =
    (q.status != null && q.status !== "all") ||
    (q.visibility != null && q.visibility !== "all") ||
    (q.source != null && q.source !== "all") ||
    q.savedView === "needs-review" ||
    q.savedView === "active-visible" ||
    q.savedView === "low-margin";
  const needsBrands = Boolean(q.search?.trim());

  // Counted by product, not by row. A jacket in twelve colours is one thing to
  // manage, and counting rows made the header read 148,039 when the catalogue
  // holds 19,615 products.
  const countQuery = db
    .select({ count: sql<number>`count(distinct ${products.variantGroupId})` })
    .from(products)
    .$dynamic();
  if (needsMeta) countQuery.innerJoin(productMeta, eq(productMeta.productId, products.id));
  if (needsBrands) countQuery.leftJoin(brands, eq(brands.id, products.brandId));
  const [countRow] = await countQuery.where(where);
  const total = Number(countRow?.count ?? 0);

  /**
   * One page of variant groups.
   *
   * MySQL cannot hand back a whole row per group, so this asks for each group's
   * aggregates plus the id of its cheapest member, then fetches those rows in
   * full. Two indexed queries instead of one, and far less work than loading
   * every variant to display a summary of it.
   */
  const groupQuery = db
    .select({
      gid: products.variantGroupId,
      repId: sql<string>`substring_index(group_concat(${products.id} order by ${products.priceCents} asc, ${products.id} asc), ',', 1)`,
      variantCount: sql<number>`count(*)`,
      priceFrom: sql<number>`min(${products.priceCents})`,
      priceTo: sql<number>`max(${products.priceCents})`,
      totalStock: sql<number>`sum(${products.stock})`,
    })
    .from(products)
    .$dynamic();
  if (needsMeta) groupQuery.innerJoin(productMeta, eq(productMeta.productId, products.id));
  if (needsBrands) groupQuery.leftJoin(brands, eq(brands.id, products.brandId));
  const groupRows = await groupQuery
    .where(where)
    .groupBy(products.variantGroupId)
    .orderBy(...groupedOrderBy(q.sort, q.dir ?? "desc"))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const rollupById = new Map(groupRows.map((g) => [g.repId, g]));
  const repIds = groupRows.map((g) => g.repId);

  const unordered = repIds.length === 0 ? [] : await db
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
      variantGroupId: products.variantGroupId,
    })
    .from(products)
    .innerJoin(productMeta, eq(productMeta.productId, products.id))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(suppliers, eq(suppliers.id, productMeta.supplierId))
    .where(inArray(products.id, repIds));

  // Fetching by id loses the grouped ordering, so it is restored here.
  const byId = new Map(unordered.map((r) => [r.id, r]));
  const rows = repIds.map((id) => byId.get(id)).filter((r): r is (typeof unordered)[number] => Boolean(r));

  /**
   * Whether each group's variants disagree about status or visibility.
   *
   * Scoped to the groups on screen. Computing it in the rollup would force the
   * product_meta join on every page load, which is the expensive half.
   */
  const gids = groupRows.map((g) => g.gid).filter((g): g is string => Boolean(g));
  const mixedRows = gids.length === 0 ? [] : await db
    .select({
      gid: products.variantGroupId,
      statuses: sql<number>`count(distinct ${productMeta.status})`,
      visibilities: sql<number>`count(distinct ${productMeta.visibility})`,
    })
    .from(products)
    .innerJoin(productMeta, eq(productMeta.productId, products.id))
    .where(inArray(products.variantGroupId, gids))
    .groupBy(products.variantGroupId);
  const mixedByGroup = new Map(
    mixedRows.map((m) => [m.gid ?? "", { status: Number(m.statuses) > 1, visibility: Number(m.visibilities) > 1 }])
  );

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
        variantCount: Number(rollupById.get(r.id)?.variantCount ?? 1),
        priceFrom: toDollars(Number(rollupById.get(r.id)?.priceFrom ?? r.priceCents)),
        priceTo: toDollars(Number(rollupById.get(r.id)?.priceTo ?? r.priceCents)),
        totalStock: Number(rollupById.get(r.id)?.totalStock ?? r.stock),
        // Asked only for the 25 groups on screen, so it costs an indexed lookup
        // rather than a second pass over the whole table.
        mixedStatus: mixedByGroup.get(r.variantGroupId ?? "")?.status ?? false,
        mixedVisibility: mixedByGroup.get(r.variantGroupId ?? "")?.visibility ?? false,
      } as AdminProductRow;
    }),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
