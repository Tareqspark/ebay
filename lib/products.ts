import "server-only";
import { cache } from "react";
import Fuse from "fuse.js";
import { eq, inArray, desc, gt, gte, lte, and, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  products as productsTable,
  productMeta as productMetaTable,
  orderItems as orderItemsTable,
  orders as ordersTable,
  productViews as productViewsTable,
} from "@/db/schema";
import { getAllBrands, getBrandById } from "@/lib/brands";
import { getActiveBundleProductIds } from "@/lib/bundles";
import { toDollars } from "@/lib/money";
import type { Brand, Product } from "@/lib/types";
import { sortProducts, filterProducts, getPriceBounds, parseExplorerParams } from "@/lib/products-client";
import type { SortKey, ProductFilters } from "@/lib/products-client";

export { sortProducts, filterProducts, getPriceBounds, parseExplorerParams };
export type { SortKey, ProductFilters };

type ProductRow = typeof productsTable.$inferSelect;

/**
 * Restricts a storefront query to products a customer may actually buy.
 *
 * Nothing here filtered on visibility before, so hiding or archiving a
 * product in admin changed nothing on the site: three CJ-delisted items were
 * live on department pages and purchasable, and an order for them could never
 * have been fulfilled.
 *
 * Written as EXISTS rather than a join so it can be dropped into an existing
 * where() without disturbing the shape of any query. It fails closed — a
 * product with no meta row disappears rather than being sold blind — which is
 * safe because the two tables are 1:1 and inserted together.
 *
 * Deliberately NOT applied to getProductsByIds: cart, checkout and admin all
 * read through it, and they need to see an archived product to tell someone it
 * has become unavailable rather than silently dropping the line.
 */
const sellable = sql`exists (
  select 1 from ${productMetaTable}
  where ${productMetaTable.productId} = ${productsTable.id}
    and ${productMetaTable.visibility} = 'visible'
    and ${productMetaTable.status} = 'active'
)`;

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
    variantGroupId: row.variantGroupId ?? undefined,
    variantLabel: row.variantLabel ?? undefined,
    variantOptions: row.variantOptions ?? undefined,
  };
}

/** All 2,800+ products, cached once per request — every fetch helper below filters this in memory rather than re-querying, since the whole catalog is a fast, cacheable read compared to the many small selective queries the storefront would otherwise issue per request. */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(sellable),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const [row] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.slug, slug), sellable))
    .limit(1);
  if (!row) return undefined;
  return toProduct(row, await getBrandNameById());
}

/**
 * Whether a customer may put this product in a basket.
 *
 * Separate from the query-level guard because the cart takes a product id
 * straight from a request: filtering discovery stops an archived product being
 * found, but not being added by anyone who kept the id.
 */
export async function isProductSellable(productId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(and(eq(productsTable.id, productId), sellable))
    .limit(1);
  return Boolean(row);
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
/**
 * Products in a category, narrowed by the database rather than in JavaScript.
 *
 * This previously called getAllProducts() and filtered the result, which meant
 * every category page loaded all 11,807 products to display a handful — the
 * main reason a category page transfers 1.5MB and the homepage 2.5MB. It also
 * put a hard ceiling on catalogue growth: the same page at 50,000 products
 * would not stand up.
 *
 * categorySlugPath is a JSON array, so each depth is matched by extracting its
 * element — the same approach buildRuleConditions already uses for collection
 * rules.
 */
export async function getProductsByCategoryPath(segments: string[]): Promise<Product[]> {
  if (segments.length === 0) return getAllProducts();

  const conditions = segments
    .slice(0, 3)
    .map((seg, i) => sql`json_unquote(json_extract(${productsTable.categorySlugPath}, ${`$[${i}]`})) = ${seg}`);

  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(and(...conditions, sellable)),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/**
 * A UTC day number, used to seed the rotating rails.
 *
 * Rotation is by day rather than per request so a visitor sees a consistent
 * homepage while they browse, and the response stays cacheable — but the shop
 * does not show the same twelve products forever.
 */
function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

/**
 * A window over a pool of products that advances each day and wraps around.
 *
 * Every rail used to be `where(flag).limit(12)` with no ORDER BY, so MySQL
 * returned the same twelve rows on every request for all time. Ordering by id
 * makes the window deterministic; offsetting it by the day makes it move.
 */
async function rotatingWindow(condition: SQL | undefined, limit: number): Promise<Product[]> {
  const [countRow] = await db
    .select({ n: sql<number>`count(*)` })
    .from(productsTable)
    .where(condition);
  const total = Number(countRow?.n ?? 0);
  if (total === 0) return [];

  const brandNameById = await getBrandNameById();
  const take = Math.min(limit, total);
  const offset = total <= take ? 0 : (dayIndex() * take) % total;

  const page = async (off: number, n: number) =>
    db.select().from(productsTable).where(condition).orderBy(productsTable.id).limit(n).offset(off);

  const rows = await page(offset, take);
  // The window can run off the end of the pool; wrap rather than return short.
  if (rows.length < take) rows.push(...(await page(0, take - rows.length)));
  return rows.map((r) => toProduct(r, brandNameById));
}

/** No real discount data behind is_deal — it was seeded — so this rotates daily rather than pretending to rank. */
export async function getDealsProducts(limit = 12): Promise<Product[]> {
  return rotatingWindow(and(eq(productsTable.isDeal, true), sellable), limit);
}

export async function getFlashSaleProducts(limit = 12): Promise<Product[]> {
  return rotatingWindow(and(eq(productsTable.isFlashSale, true), sellable), limit);
}

/**
 * Ranked by what people actually looked at in the last week.
 *
 * product_views is thin so far, so this falls back to the seeded flag when
 * there is not enough real signal to fill the rail — a half-empty rail of
 * genuine data plus padding beats a full rail of fiction.
 */
export async function getTrendingProducts(limit = 12): Promise<Product[]> {
  const viewed = await db
    .select({ productId: productViewsTable.productId, views: sql<number>`count(*)`.as("views") })
    .from(productViewsTable)
    .innerJoin(productsTable, eq(productsTable.id, productViewsTable.productId))
    .where(and(gte(productViewsTable.viewedAt, sql`now() - interval 7 day`), sellable))
    .groupBy(productViewsTable.productId)
    .orderBy(desc(sql`views`))
    .limit(limit);

  const fromViews = await getProductsByIds(viewed.map((v) => v.productId));
  if (fromViews.length >= limit) return fromViews;

  const seen = new Set(fromViews.map((p) => p.id));
  const padding = await rotatingWindow(and(eq(productsTable.isTrending, true), sellable), limit * 2);
  return [...fromViews, ...padding.filter((p) => !seen.has(p.id))].slice(0, limit);
}

/**
 * Genuinely the newest products, not the flag.
 *
 * is_new_arrival is true on 29,655 of 29,657 products because the importer
 * sets it on everything, so filtering on it means "the whole catalogue" — and
 * with no ORDER BY the rail was showing the twelve *oldest* items. Product ids
 * are ULIDs, which sort by creation time, so newest-first needs no new column.
 */
export async function getNewArrivalProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(sellable).orderBy(desc(productsTable.id)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/**
 * Real sales where they exist, best-reviewed where they do not.
 *
 * The is_best_seller flag was seeded randomly and measures nothing. Until
 * order history is deep enough to rank on, the honest proxy is the products
 * customers rated highly and in volume.
 */
export async function getBestSellerProducts(limit = 12): Promise<Product[]> {
  const sold = await getTopSellingProducts(limit);
  if (sold.length >= limit) return sold;

  const seen = new Set(sold.map((p) => p.id));
  const [rows, brandNameById] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(and(gt(productsTable.ratingCount, 0), sellable))
      .orderBy(desc(productsTable.ratingValue), desc(productsTable.ratingCount))
      .limit(limit * 2),
    getBrandNameById(),
  ]);
  const rated = rows.map((r) => toProduct(r, brandNameById)).filter((p) => !seen.has(p.id));
  return [...sold, ...rated].slice(0, limit);
}

/** Ranked by real sales — SUM(order_items.quantity) across paid orders, not a seeded flag like the other rails above. Empty until real orders exist. */
export async function getTopSellingProducts(limit = 12): Promise<Product[]> {
  const rows = await db
    .select({ productId: orderItemsTable.productId, totalSold: sql<number>`sum(${orderItemsTable.quantity})`.as("total_sold") })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, orderItemsTable.orderId))
    .innerJoin(productsTable, eq(productsTable.id, orderItemsTable.productId))
    .where(and(eq(ordersTable.paymentStatus, "paid"), sellable))
    .groupBy(orderItemsTable.productId)
    .orderBy(desc(sql`total_sold`))
    .limit(limit);
  return getProductsByIds(rows.map((r) => r.productId));
}

/** Ranked by ratingCount — the review-count field already shown on every product card, not the (currently empty) reviews table. */
export async function getMostReviewedProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(and(gt(productsTable.ratingCount, 0), sellable))
      .orderBy(desc(productsTable.ratingCount))
      .limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/** Admin-curated (see lib/admin/homepage-deals-actions.ts) — hand-picked, not computed. */
export async function getFeaturedDealProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(and(eq(productsTable.isFeaturedDeal, true), sellable)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/** Admin-curated (see lib/admin/homepage-deals-actions.ts) — hand-picked, not computed. */
export async function getWeeklyTopDealProducts(limit = 12): Promise<Product[]> {
  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(and(eq(productsTable.isWeeklyTopDeal, true), sellable)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

export interface CollectionRule {
  topCategorySlug?: string | null;
  minPriceCents?: number | null;
  maxPriceCents?: number | null;
  minRating?: string | null;
  bundledOnly?: boolean | null;
}

async function buildRuleConditions(rule: CollectionRule) {
  const conditions = [];
  if (rule.topCategorySlug) {
    conditions.push(sql`json_unquote(json_extract(${productsTable.categorySlugPath}, '$[0]')) = ${rule.topCategorySlug}`);
  }
  if (rule.minPriceCents != null) conditions.push(gte(productsTable.priceCents, rule.minPriceCents));
  if (rule.maxPriceCents != null) conditions.push(lte(productsTable.priceCents, rule.maxPriceCents));
  if (rule.minRating != null) conditions.push(gte(productsTable.ratingValue, rule.minRating));
  if (rule.bundledOnly) {
    const bundledIds = await getActiveBundleProductIds();
    conditions.push(bundledIds.length > 0 ? inArray(productsTable.id, bundledIds) : sql`false`);
  }
  // Appended last and deliberately not counted as a criterion: callers treat
  // an empty list as "this rule selects nothing", and a collection with no
  // rule set must keep meaning that rather than suddenly meaning "everything".
  return conditions.length > 0 ? [...conditions, sellable] : [];
}

/** Real-time membership for an "automated" collection (see lib/collections.ts) — every condition present is ANDed, so a product added to the catalog tomorrow that matches shows up here without anyone re-curating anything. */
export async function getProductsMatchingRule(rule: CollectionRule, limit = 60): Promise<Product[]> {
  const conditions = await buildRuleConditions(rule);
  if (conditions.length === 0) return [];

  const [rows, brandNameById] = await Promise.all([
    db.select().from(productsTable).where(and(...conditions)).limit(limit),
    getBrandNameById(),
  ]);
  return rows.map((r) => toProduct(r, brandNameById));
}

/** Same conditions as getProductsMatchingRule, but a plain count — powers the admin collections list's "Products" column without fetching/mapping full rows just to count them. */
export async function countProductsMatchingRule(rule: CollectionRule): Promise<number> {
  const conditions = await buildRuleConditions(rule);
  if (conditions.length === 0) return 0;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(and(...conditions));
  return count;
}

/** How far back a view still counts as "trending". */
const TRENDING_WINDOW_DAYS = 30;
/** The pool the value tier rotates through — deep enough to stay fresh for months. */
const HIGH_VALUE_POOL = 300;
/** Junk at any price is still junk; nothing below this gets recommended. */
const MIN_RECOMMENDABLE_RATING = "4.0";

/**
 * High-value products that people are actually looking at.
 *
 * Two tiers, because the view log is still thin. First, anything genuinely
 * viewed in the last 30 days, ranked by views and then by price so the more
 * valuable of two equally popular items wins. Then, to fill the rail, a daily
 * rotating window over the most expensive well-rated stock.
 *
 * Ranked on price rather than margin deliberately: margin would be the sharper
 * business metric, but cj_shipping_fee_cents is NULL for every CJ product, so
 * the margin we can compute today is gross and overstates the cheap end. Swap
 * the ordering here if that gets backfilled.
 */
export async function getHighValueTrendingProducts(limit = 12, excludeIds: string[] = []): Promise<Product[]> {
  const excluded = new Set(excludeIds);
  const brandNameById = await getBrandNameById();
  const quality = and(gte(productsTable.ratingValue, MIN_RECOMMENDABLE_RATING), sellable);

  const viewed = await db
    .select({
      row: productsTable,
      views: sql<number>`count(${productViewsTable.id})`.as("views"),
    })
    .from(productsTable)
    .innerJoin(productViewsTable, eq(productViewsTable.productId, productsTable.id))
    .where(
      and(
        quality,
        gte(productViewsTable.viewedAt, sql`now() - interval ${sql.raw(String(TRENDING_WINDOW_DAYS))} day`)
      )
    )
    .groupBy(productsTable.id)
    /**
     * Views multiplied by price, not views then price.
     *
     * Ranking on views alone filled the rail with cheap popular items — the
     * viewed set averaged $23 against a high-value pool starting at $80 — and
     * price as a tiebreak almost never fired, because two products rarely
     * share an exact view count. Multiplying makes a $60 item seen twice
     * outrank a $5 item seen five times, which is what "high value trending"
     * has to mean to be worth a rail.
     */
    .orderBy(desc(sql`count(${productViewsTable.id}) * ${productsTable.priceCents}`))
    .limit(limit * 2);

  /**
   * Trending takes at most half the rail.
   *
   * There are only ~23 products with any recent views, so letting them fill
   * all fourteen slots dragged the tail down to £9 toys — the rail said "high
   * value" and showed the cheapest thing anyone had clicked. Capping the
   * trending share keeps the rest for genuinely valuable stock, and the cap
   * stops mattering on its own as the view log grows.
   */
  const trendingSlots = Math.ceil(limit / 2);
  const picked: Product[] = [];
  for (const v of viewed) {
    if (picked.length >= trendingSlots) break;
    if (excluded.has(v.row.id)) continue;
    picked.push(toProduct(v.row, brandNameById));
    excluded.add(v.row.id);
  }

  // Top up from the most valuable well-rated stock, windowed by day so the
  // rail is not the same twelve items every visit.
  const pool = await db
    .select()
    .from(productsTable)
    .where(quality)
    .orderBy(desc(productsTable.priceCents), productsTable.id)
    .limit(HIGH_VALUE_POOL);

  if (pool.length === 0) return picked;
  const start = (dayIndex() * limit) % pool.length;
  for (let i = 0; i < pool.length && picked.length < limit; i++) {
    const row = pool[(start + i) % pool.length];
    if (excluded.has(row.id)) continue;
    picked.push(toProduct(row, brandNameById));
    excluded.add(row.id);
  }
  return picked;
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

/* ------------------------------------------------------------------ *
 * Server-side category browsing
 * ------------------------------------------------------------------ */

export interface CategoryBrowseParams {
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface CategoryBrowseResult {
  products: Product[];
  /** Products matching the active filters — drives the result count and paging. */
  total: number;
  /** Products in the category regardless of filters — drives the page heading. */
  totalInCategory: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Facets are computed over the whole category, never the filtered subset, so
   *  the slider and brand list stay put instead of collapsing as you narrow. */
  bounds: { min: number; max: number };
  brands: Brand[];
}

export const CATEGORY_PAGE_SIZE = 24;

function categoryPathConditions(segments: string[]) {
  // sellable last, so the browse page, its count and its facets all agree on
  // which products exist. A hidden product must not be paged over, counted,
  // or contribute a brand to the filter list.
  return [
    ...segments
      .slice(0, 3)
      .map((seg, i) => sql`json_unquote(json_extract(${productsTable.categorySlugPath}, ${`$[${i}]`})) = ${seg}`),
    sellable,
  ];
}

/**
 * One page of a category, filtered and sorted in SQL.
 *
 * The page previously loaded every product in the department and handed the
 * lot to the browser, which then showed 24 of them. Pet Supplies alone was
 * 5.8MB of payload to render one screen, growing linearly with the catalogue.
 *
 * Filtering and sorting had to move down here with the paging: applied in the
 * client they would only ever see the current page, so "under $20" would
 * quietly mean "under $20 among these 24".
 */
/** One row per variant group, cheapest member representing it, with the group's own aggregates. */
interface GroupRow {
  row: typeof productsTable.$inferSelect;
  variantCount: number;
  priceFrom: number;
  priceTo: number;
}

/**
 * A page of variant groups rather than a page of rows.
 *
 * MySQL has no "pick a whole row per group", so the group query returns each
 * group's aggregates plus the id of its cheapest member — GROUP_CONCAT ordered
 * by price, first element — and the full rows are then fetched by those ids and
 * put back into the group order. Two indexed queries rather than one, which is
 * still far less work than shipping every variant to the browser.
 */
async function pageOfGroups(
  where: SQL | undefined,
  order: SQL[],
  limit: number,
  offset: number
): Promise<GroupRow[]> {
  const groups = await db
    .select({
      gid: productsTable.variantGroupId,
      repId: sql<string>`substring_index(group_concat(${productsTable.id} order by ${productsTable.priceCents} asc, ${productsTable.id} asc), ',', 1)`,
      variantCount: sql<number>`count(*)`,
      priceFrom: sql<number>`min(${productsTable.priceCents})`,
      priceTo: sql<number>`max(${productsTable.priceCents})`,
    })
    .from(productsTable)
    .where(where)
    .groupBy(productsTable.variantGroupId)
    .orderBy(...order)
    .limit(limit)
    .offset(offset);

  if (groups.length === 0) return [];

  const repIds = groups.map((g) => g.repId);
  const rows = await db.select().from(productsTable).where(inArray(productsTable.id, repIds));
  const byId = new Map(rows.map((r) => [r.id, r]));

  return groups
    .map((g) => {
      const row = byId.get(g.repId);
      return row
        ? { row, variantCount: Number(g.variantCount), priceFrom: Number(g.priceFrom), priceTo: Number(g.priceTo) }
        : null;
    })
    .filter((g): g is GroupRow => g !== null);
}

export async function browseCategory(
  segments: string[],
  params: CategoryBrowseParams = {}
): Promise<CategoryBrowseResult> {
  const pageSize = params.pageSize ?? CATEGORY_PAGE_SIZE;
  const base = categoryPathConditions(segments);

  const filters = [...base];
  if (params.brandIds?.length) filters.push(inArray(productsTable.brandId, params.brandIds));
  if (params.minPrice !== undefined) filters.push(gte(productsTable.priceCents, Math.round(params.minPrice * 100)));
  if (params.maxPrice !== undefined) filters.push(lte(productsTable.priceCents, Math.round(params.maxPrice * 100)));
  if (params.minRating !== undefined && params.minRating > 0) {
    filters.push(gte(productsTable.ratingValue, String(params.minRating)));
  }

  /**
   * Ordering has to be aggregate-only.
   *
   * The query groups by variant_group_id, and MySQL runs with
   * ONLY_FULL_GROUP_BY, so sorting on a bare column is rejected outright —
   * "price_cents is not in GROUP BY". Each sort therefore picks the aggregate
   * that means the right thing for a group: cheapest ascending, dearest
   * descending, best rating, newest member.
   *
   * Every ordering ends in the group id. Without a unique tiebreaker MySQL may
   * order equal values differently between pages, which silently repeats some
   * products and skips others across OFFSET boundaries.
   */
  const order = (() => {
    const tiebreak = sql`${productsTable.variantGroupId} asc`;
    switch (params.sort) {
      case "price-asc": return [sql`min(${productsTable.priceCents}) asc`, tiebreak];
      case "price-desc": return [sql`max(${productsTable.priceCents}) desc`, tiebreak];
      case "rating": return [sql`max(${productsTable.ratingValue}) desc`, tiebreak];
      // Product ids are ULIDs, so the highest id in a group is its newest row.
      case "newest": return [sql`max(${productsTable.id}) desc`, tiebreak];
      default: return [tiebreak];
    }
  })();

  // Counted and paged by group, not by row: a coat in five sizes is one
  // product to a shopper, and paging by row put the same card on screen five
  // times and made the result count meaningless.
  const [countRow] = await db
    .select({ n: sql<number>`count(distinct ${productsTable.variantGroupId})` })
    .from(productsTable)
    .where(and(...filters));
  const total = Number(countRow?.n ?? 0);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, params.page ?? 1), pageCount);

  const [rows, brandNameById, facets] = await Promise.all([
    pageOfGroups(and(...filters), order, pageSize, (page - 1) * pageSize),
    getBrandNameById(),
    db
      .select({
        n: sql<number>`count(distinct ${productsTable.variantGroupId})`,
        min: sql<number>`min(${productsTable.priceCents})`,
        max: sql<number>`max(${productsTable.priceCents})`,
      })
      .from(productsTable)
      .where(and(...base)),
  ]);

  const facet = facets[0];
  const totalInCategory = Number(facet?.n ?? 0);

  // Mirrors getPriceBounds' contract: max is always strictly above min, or the
  // price Slider throws.
  const minDollars = Math.floor(Number(facet?.min ?? 0) / 100);
  const maxDollars = Math.ceil(Number(facet?.max ?? 100) / 100);
  const bounds = { min: minDollars, max: maxDollars > minDollars ? maxDollars : minDollars + 1 };

  const brandIdRows = await db
    .selectDistinct({ brandId: productsTable.brandId })
    .from(productsTable)
    .where(and(...base));
  const ids = brandIdRows.map((r) => r.brandId).filter(Boolean);
  const brands: Brand[] = ids.length
    ? (await getAllBrands()).filter((b) => ids.includes(b.id)).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    products: rows.map((g) => ({
      ...toProduct(g.row, brandNameById),
      variantCount: g.variantCount,
      priceFrom: toDollars(g.priceFrom),
      priceTo: toDollars(g.priceTo),
    })),
    total,
    totalInCategory,
    page,
    pageSize,
    pageCount,
    bounds,
    brands,
  };
}

/**
 * Same shape as browseCategory, for pages whose result set is already in
 * memory and bounded — search caps at 200 hits, a collection at 60. Paging
 * those in SQL would buy nothing, but they render the same explorer, so they
 * have to speak the same language.
 */
export function paginateProducts(
  all: Product[],
  params: CategoryBrowseParams,
  brands: Brand[]
): CategoryBrowseResult {
  const pageSize = params.pageSize ?? CATEGORY_PAGE_SIZE;
  const bounds = getPriceBounds(all);

  const filtered = sortProducts(
    filterProducts(all, {
      brandIds: params.brandIds?.length ? params.brandIds : undefined,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      minRating: params.minRating,
    }),
    params.sort ?? "relevance"
  );

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, params.page ?? 1), pageCount);

  return {
    products: filtered.slice((page - 1) * pageSize, page * pageSize),
    total,
    totalInCategory: all.length,
    page,
    pageSize,
    pageCount,
    bounds,
    brands,
  };
}

/** Fills URL-absent filters with the category's own bounds, for the client's controls. */
export function toExplorerState(
  params: CategoryBrowseParams,
  result: CategoryBrowseResult
): {
  brandIds: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sort: SortKey;
  page: number;
} {
  return {
    brandIds: params.brandIds ?? [],
    minPrice: params.minPrice ?? result.bounds.min,
    maxPrice: params.maxPrice ?? result.bounds.max,
    minRating: params.minRating ?? 0,
    sort: params.sort ?? "relevance",
    page: result.page,
  };
}

/**
 * The other variants of a product, for the selector on its page.
 *
 * Each variant keeps its own URL, so the selector is a set of links rather
 * than client state: the page stays server-rendered, every colour and size is
 * separately indexable, and add-to-cart needs no changes because the page you
 * are on already is the variant you would buy.
 *
 * Returns an empty array for a product with no siblings, so callers can render
 * nothing without a special case.
 */
export async function getVariantSiblings(product: Product): Promise<Product[]> {
  if (!product.variantGroupId) return [];

  const [rows, brandNameById] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.variantGroupId, product.variantGroupId), sellable))
      .orderBy(productsTable.priceCents, productsTable.id),
    getBrandNameById(),
  ]);

  if (rows.length < 2) return [];
  return rows.map((r) => toProduct(r, brandNameById));
}
