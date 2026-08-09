import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { products, productMeta, inventory, orders } from "@/db/schema";

/**
 * The dashboard's chart data, counted in SQL.
 *
 * Everything here is deliberately catalog- and operations-shaped rather than
 * sales-shaped. With only a handful of orders on the books a revenue trend
 * is three dots and a flat line, which reads as a broken chart rather than a
 * quiet week. The catalog, by contrast, is already large enough that its
 * distribution says something true — so that is what gets charted until
 * order volume can carry a time series.
 */

export interface Band {
  label: string;
  count: number;
  /** Drives severity colour and ordering; not a categorical series. */
  tone: "good" | "warning" | "critical" | "neutral";
  href?: string;
}

export interface DashboardCharts {
  marginBands: Band[];
  stockHealth: Band[];
  orderAging: Band[];
  fulfilmentPipeline: Band[];
  readiness: { label: string; count: number; href: string; tone: Band["tone"] }[];
  emptyCategories: number;
}

/** Margin as a fraction of price, matching the Products table's low-margin view. */
const marginFraction = sql`((${products.priceCents} - ${productMeta.costCents}) / NULLIF(${products.priceCents}, 0))`;

export async function getDashboardCharts(): Promise<DashboardCharts> {
  const [marginRow] = await db
    .select({
      loss: sql<number>`sum(case when ${marginFraction} < 0 then 1 else 0 end)`,
      thin: sql<number>`sum(case when ${marginFraction} >= 0 and ${marginFraction} < 0.15 then 1 else 0 end)`,
      fair: sql<number>`sum(case when ${marginFraction} >= 0.15 and ${marginFraction} < 0.30 then 1 else 0 end)`,
      good: sql<number>`sum(case when ${marginFraction} >= 0.30 and ${marginFraction} < 0.50 then 1 else 0 end)`,
      strong: sql<number>`sum(case when ${marginFraction} >= 0.50 then 1 else 0 end)`,
    })
    .from(products)
    .innerJoin(productMeta, sql`${productMeta.productId} = ${products.id}`);

  const [stockRow] = await db
    .select({
      inStock: sql<number>`sum(${inventory.status} = 'in_stock')`,
      low: sql<number>`sum(${inventory.status} = 'low_stock')`,
      out: sql<number>`sum(${inventory.status} = 'out_of_stock')`,
      backorder: sql<number>`sum(${inventory.status} = 'backorder')`,
    })
    .from(inventory);

  // Age of orders still needing action. Volume tells you how much there is;
  // age tells you whether anything is going wrong, which is the operational
  // question a dashboard should answer first.
  const [agingRow] = await db
    .select({
      fresh: sql<number>`sum(${orders.placedAt} >= now() - interval 24 hour)`,
      aging: sql<number>`sum(${orders.placedAt} < now() - interval 24 hour and ${orders.placedAt} >= now() - interval 48 hour)`,
      stale: sql<number>`sum(${orders.placedAt} < now() - interval 48 hour)`,
    })
    .from(orders)
    .where(sql`${orders.fulfillmentStatus} in ('unfulfilled', 'processing')`);

  const [pipelineRow] = await db
    .select({
      unfulfilled: sql<number>`sum(${orders.fulfillmentStatus} = 'unfulfilled')`,
      processing: sql<number>`sum(${orders.fulfillmentStatus} = 'processing')`,
      shipped: sql<number>`sum(${orders.fulfillmentStatus} = 'shipped')`,
      delivered: sql<number>`sum(${orders.fulfillmentStatus} = 'delivered')`,
    })
    .from(orders);

  const [readyRow] = await db
    .select({
      // Only own products: CJ ships its own parcels and never asks us for a
      // weight, so counting those would invent a backlog that isn't real.
      missingWeight: sql<number>`sum(${productMeta.source} = 'self' and ${products.weightOz} = 0)`,
      needsReview: sql<number>`sum(${productMeta.needsReview} = 1)`,
    })
    .from(products)
    .innerJoin(productMeta, sql`${productMeta.productId} = ${products.id}`);

  const [cjRow] = await db
    .select({ notPushed: sql<number>`count(*)` })
    .from(orders)
    .where(sql`${orders.cjSyncStatus} = 'not_sent'`);

  const [emptyCatRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sql`(select c.id from categories c
                left join products p
                  on json_unquote(json_extract(p.category_slug_path, '$[2]')) = c.slug
                where c.level = 'grandchild'
                group by c.id
                having count(p.id) = 0) as empty_cats`);

  const n = (v: unknown) => Number(v ?? 0);

  return {
    marginBands: [
      { label: "Losing money", count: n(marginRow?.loss), tone: "critical", href: "/admin/products?savedView=low-margin" },
      { label: "Under 15%", count: n(marginRow?.thin), tone: "warning", href: "/admin/products?savedView=low-margin" },
      { label: "15–30%", count: n(marginRow?.fair), tone: "neutral" },
      { label: "30–50%", count: n(marginRow?.good), tone: "good" },
      { label: "50%+", count: n(marginRow?.strong), tone: "good" },
    ],
    stockHealth: [
      { label: "In stock", count: n(stockRow?.inStock), tone: "good" },
      { label: "Low stock", count: n(stockRow?.low), tone: "warning", href: "/admin/inventory?status=low_stock" },
      { label: "Out of stock", count: n(stockRow?.out), tone: "critical", href: "/admin/inventory?status=out_of_stock" },
      { label: "Backorder", count: n(stockRow?.backorder), tone: "neutral" },
    ],
    orderAging: [
      { label: "Under 24h", count: n(agingRow?.fresh), tone: "good" },
      { label: "24–48h", count: n(agingRow?.aging), tone: "warning" },
      { label: "Over 48h", count: n(agingRow?.stale), tone: "critical" },
    ],
    fulfilmentPipeline: [
      { label: "Unfulfilled", count: n(pipelineRow?.unfulfilled), tone: "warning" },
      { label: "Processing", count: n(pipelineRow?.processing), tone: "neutral" },
      { label: "Shipped", count: n(pipelineRow?.shipped), tone: "good" },
      { label: "Delivered", count: n(pipelineRow?.delivered), tone: "good" },
    ],
    readiness: [
      { label: "Own products with no shipping weight", count: n(readyRow?.missingWeight), href: "/admin/products?source=self", tone: "critical" },
      { label: "Products flagged for review", count: n(readyRow?.needsReview), href: "/admin/products?savedView=needs-review", tone: "warning" },
      { label: "CJ orders not yet pushed", count: n(cjRow?.notPushed), href: "/admin/cj/orders", tone: "warning" },
    ],
    emptyCategories: n(emptyCatRow?.count),
  };
}

export interface MatrixCell {
  row: string;
  col: string;
  count: number;
  href?: string;
}

export interface Matrix {
  rows: string[];
  cols: string[];
  cells: MatrixCell[];
  max: number;
}

export interface RankedBar {
  label: string;
  value: number;
  href?: string;
}

const PRICE_BANDS = ["Under $10", "$10–25", "$25–50", "$50–100", "$100+"] as const;
const MARGIN_BANDS = ["Loss", "0–15%", "15–30%", "30–50%", "50%+"] as const;

const priceBandCase = sql`case
  when ${products.priceCents} < 1000 then 'Under $10'
  when ${products.priceCents} < 2500 then '$10–25'
  when ${products.priceCents} < 5000 then '$25–50'
  when ${products.priceCents} < 10000 then '$50–100'
  else '$100+' end`;

const marginBandCase = sql`case
  when ${marginFraction} < 0 then 'Loss'
  when ${marginFraction} < 0.15 then '0–15%'
  when ${marginFraction} < 0.30 then '15–30%'
  when ${marginFraction} < 0.50 then '30–50%'
  else '50%+' end`;

/**
 * Price band against margin band, counted per cell.
 *
 * A single margin bar says how much of the catalog is thin; this says *where*
 * — whether the weak margins sit on cheap impulse items, where it may be
 * acceptable, or on the expensive lines that are supposed to be carrying the
 * business. That is a different decision, and one no single-axis chart can
 * pose.
 */
export async function getPriceMarginMatrix(): Promise<Matrix> {
  const rows = await db
    .select({ price: priceBandCase, margin: marginBandCase, count: sql<number>`count(*)` })
    .from(products)
    .innerJoin(productMeta, sql`${productMeta.productId} = ${products.id}`)
    .groupBy(priceBandCase, marginBandCase);

  const cells: MatrixCell[] = [];
  let max = 0;
  for (const r of rows) {
    const count = Number(r.count ?? 0);
    max = Math.max(max, count);
    cells.push({ row: String(r.price), col: String(r.margin), count });
  }
  return { rows: [...PRICE_BANDS], cols: [...MARGIN_BANDS], cells, max };
}

/**
 * Stock state per department. An overall stock bar hides the case that
 * actually matters — a shortage concentrated in one department rather than
 * spread thinly across all of them.
 */
export async function getDepartmentStockMatrix(limit = 8): Promise<Matrix> {
  const rows = await db
    .select({
      dept: sql<string>`json_unquote(json_extract(${products.categorySlugPath}, '$[0]'))`,
      status: inventory.status,
      count: sql<number>`count(*)`,
    })
    .from(inventory)
    .innerJoin(products, sql`${products.id} = ${inventory.productId}`)
    .groupBy(sql`json_unquote(json_extract(${products.categorySlugPath}, '$[0]'))`, inventory.status);

  const totals = new Map<string, number>();
  for (const r of rows) totals.set(r.dept, (totals.get(r.dept) ?? 0) + Number(r.count ?? 0));
  // Largest departments only: a 31-row grid is a wall, not a signal.
  const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([d]) => d);
  const keep = new Set(top);

  const cols = ["in_stock", "low_stock", "out_of_stock", "backorder"];
  const cells: MatrixCell[] = [];
  let max = 0;
  for (const r of rows) {
    if (!keep.has(r.dept)) continue;
    const count = Number(r.count ?? 0);
    max = Math.max(max, count);
    cells.push({
      row: r.dept,
      col: r.status,
      count,
      href: `/admin/inventory?status=${r.status}`,
    });
  }
  return { rows: top, cols, cells, max };
}

/** Departments by product count, largest first — the catalog's concentration. */
export async function getDepartmentRanking(limit = 10): Promise<RankedBar[]> {
  const rows = await db
    .select({
      dept: sql<string>`json_unquote(json_extract(${products.categorySlugPath}, '$[0]'))`,
      count: sql<number>`count(*)`,
    })
    .from(products)
    .groupBy(sql`json_unquote(json_extract(${products.categorySlugPath}, '$[0]'))`)
    .orderBy(sql`count(*) desc`)
    .limit(limit);

  return rows.map((r) => ({
    label: r.dept,
    value: Number(r.count ?? 0),
    href: `/admin/products?category=${encodeURIComponent(r.dept)}`,
  }));
}

/** Where the catalog sits on price, and on customer rating. */
export async function getCatalogHistograms(): Promise<{ price: RankedBar[]; rating: RankedBar[] }> {
  const [priceRow] = await db
    .select({
      a: sql<number>`sum(${products.priceCents} < 1000)`,
      b: sql<number>`sum(${products.priceCents} >= 1000 and ${products.priceCents} < 2500)`,
      c: sql<number>`sum(${products.priceCents} >= 2500 and ${products.priceCents} < 5000)`,
      d: sql<number>`sum(${products.priceCents} >= 5000 and ${products.priceCents} < 10000)`,
      e: sql<number>`sum(${products.priceCents} >= 10000)`,
    })
    .from(products);

  const [ratingRow] = await db
    .select({
      a: sql<number>`sum(${products.ratingValue} < 3)`,
      b: sql<number>`sum(${products.ratingValue} >= 3 and ${products.ratingValue} < 4)`,
      c: sql<number>`sum(${products.ratingValue} >= 4 and ${products.ratingValue} < 4.5)`,
      d: sql<number>`sum(${products.ratingValue} >= 4.5)`,
    })
    .from(products);

  const n = (v: unknown) => Number(v ?? 0);
  return {
    price: [
      { label: "Under $10", value: n(priceRow?.a) },
      { label: "$10–25", value: n(priceRow?.b) },
      { label: "$25–50", value: n(priceRow?.c) },
      { label: "$50–100", value: n(priceRow?.d) },
      { label: "$100+", value: n(priceRow?.e) },
    ],
    rating: [
      { label: "Under 3★", value: n(ratingRow?.a) },
      { label: "3–4★", value: n(ratingRow?.b) },
      { label: "4–4.5★", value: n(ratingRow?.c) },
      { label: "4.5★+", value: n(ratingRow?.d) },
    ],
  };
}
