/**
 * Imports US-warehouse products, discovered through the product list rather
 * than by sweeping category leaves.
 *
 * The existing sweep walks our 502 category leaves and asks CJ for products in
 * each. That cannot express "US warehouse only", so this one drives from
 * /product/list with the filters CJ supports directly — countryCode, a stock
 * floor and a price band — and files each product by the category id the list
 * already returns, which matches the ids our tree is keyed on.
 *
 * Cost is one detail call per product, 10 points, plus about half a point of
 * discovery. The stock call the sweep makes is skipped deliberately:
 * startInventory=10 already guarantees stock exists, and /product/query returns
 * inventoryNum as null anyway, so paying 10 more points per product would buy
 * nothing. Stock is recorded as the floor the filter guarantees rather than
 * invented — see NOMINAL_STOCK.
 *
 * Pages are visited in random order. Walking them in sequence would fill the
 * catalogue with whatever CJ happens to sort first, which clusters by supplier
 * and category; a shuffle spreads the intake across the whole result set.
 *
 * The list is queried in price bands, not as one filter. CJ will not serve any
 * page past offset 6,000, so a single query matching 37,132 products yields the
 * first 6,000 and refuses the rest — which is exactly where the first attempt
 * stopped, at 6,383 products, re-requesting 311 impossible pages twice a day.
 * The ceiling applies per result set, so nine narrower price windows reach
 * ~36,700 where one wide one reached 6,000. See discoverBands.
 *
 * Resumable: pages already consumed are checkpointed, so a quota stop or a
 * dropped connection just means running it again.
 */
import fs from "node:fs";
import { and, eq, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { ulid } from "ulid";
import * as schema from "../db/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

const APPLY = process.argv.includes("--apply");
/** Re-probe the price bands instead of reusing the cached ones. CJ's totals
 *  drift as stock moves, so a band balanced months ago can outgrow the
 *  ceiling; this is the way to rebalance without hand-editing a checkpoint. */
const REDISCOVER = process.argv.includes("--rediscover");
const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const MIN_CALL_GAP_MS = Number(process.env.CJ_GAP_MS ?? 1500);
const TARGET = Number(process.env.CJ_US_TARGET ?? 30000);
/**
 * Deliberately shallow. The catalogue already holds 148,039 rows from 19,615
 * products, the database is 348MB against a 128MB buffer pool, and every extra
 * row makes the listing queries slower. Depth can be backfilled later for
 * products that sell; breadth cannot be un-imported cheaply.
 */
const MAX_VARIANTS = Number(process.env.CJ_US_MAX_VARIANTS ?? 3);
/**
 * The list filter guarantees at least this many units exist, so it is the
 * honest floor rather than a number we made up. Real per-variant stock would
 * cost another 10 points per product and CJ returns it as null on the detail
 * call regardless.
 */
const NOMINAL_STOCK = 10;
const PAGE_SIZE = 100;
/**
 * CJ refuses any page past offset 6,000 — `code 1600300, "the max offset is
 * 6000"`. It is not documented in the response until you hit it, and it is a
 * property of the *result set*, not the account, so it applies afresh to every
 * distinct filter combination.
 *
 * This is what stalled the first attempt. A single query matching 37,132
 * products could only ever yield the first 6,000 of them; the remaining 311 of
 * 372 pages returned 1600300 on every run, at the full 50 points each, and the
 * importer sat at 6,383 products burning ~31,100 points a day against a 50,000
 * budget. The answer is not to ask for deeper pages but to ask narrower
 * questions — see discoverBands.
 */
const MAX_OFFSET = 6000;
const MAX_PAGES_PER_BAND = MAX_OFFSET / PAGE_SIZE;
/**
 * Bands are split until they fit under this rather than under MAX_OFFSET. CJ's
 * totals drift as stock moves, and a band discovered at 5,999 today would start
 * losing its tail tomorrow.
 */
const SAFE_BAND_TOTAL = 5500;
const BASE_FILTERS = "countryCode=US&startInventory=10";
const MIN_PRICE = Number(process.env.CJ_US_MIN_PRICE ?? 10);
const MAX_PRICE = Number(process.env.CJ_US_MAX_PRICE ?? 500);
const priceFilter = (lo: number, hi: number) => `${BASE_FILTERS}&minPrice=${lo}&maxPrice=${hi}`;
const CHECKPOINT = new URL("./.cj-us-import.json", import.meta.url);
const GENERIC_BRAND_ID = "cj-marketplace";

class QuotaExceededError extends Error {}

interface CjListItem {
  pid: string;
  productNameEn?: string;
  productImage?: string;
  sellPrice?: number | string;
  categoryId?: string;
  productWeight?: number | string;
}
interface CjVariant {
  vid: string;
  variantKey?: string;
  variantSku?: string;
  variantImage?: string;
  variantSellPrice?: number | string;
}
interface CjDetail {
  pid: string;
  productNameEn?: string;
  description?: string;
  bigImage?: string;
  productImageSet?: string[];
  variants?: CjVariant[];
}

let token: { value: string; expiresAt: number } | null = null;
async function getToken(): Promise<string> {
  if (token && token.expiresAt > Date.now()) return token.value;
  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const body = await res.json();
  if (!body.result) throw new Error(`CJ authentication failed: ${body.message}`);
  token = { value: body.data.accessToken, expiresAt: new Date(body.data.accessTokenExpiryDate).getTime() };
  return token.value;
}

let lastCallAt = 0;
let points = { used: 0, total: 0 };
/**
 * Set by cjGet when the last call failed in a way that will never succeed, so
 * a caller can tell "try again later" from "stop asking". Read immediately
 * after the call that set it; every call resets it.
 */
let lastCallWasRefused = false;

async function cjGet<T>(path: string): Promise<T | null> {
  lastCallWasRefused = false;
  for (let attempt = 0; attempt < 4; attempt++) {
    const wait = Math.max(0, lastCallAt + MIN_CALL_GAP_MS - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();

    const res = await fetch(`${CJ_BASE}${path}`, { headers: { "CJ-Access-Token": await getToken() } });
    let body: Record<string, unknown>;
    try {
      body = await res.json();
    } catch {
      // CJ occasionally answers with something that is not JSON at all. That
      // killed an overnight run once, so it is treated as retryable rather
      // than fatal.
      await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
      continue;
    }

    const info = body.pointsInfo as { usedToday: number; total: number } | undefined;
    if (info) points = { used: info.usedToday, total: info.total };
    // getInventoryByPid answers with success where the others answer with
    // result; checking only one silently returns null.
    if (body.result ?? body.success) return body.data as T;

    const message = String(body.message ?? "");
    const rateLimited = res.status === 429 || /too many requests|qps limit/i.test(message);
    if (!rateLimited && (body.code === 1600014 || /access has been disabled/i.test(message))) {
      throw new QuotaExceededError(`API access disabled — ${message}`);
    }
    if (!rateLimited && (body.code === 16900500 || /insufficient.*points|quota/i.test(message))) {
      throw new QuotaExceededError(message);
    }
    if (rateLimited || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
      continue;
    }
    /**
     * 1600300 is the offset ceiling, and no amount of retrying changes it.
     * Flagged rather than merely returned null so the caller can record the
     * page as done instead of queueing it again on the next run — the loop
     * that re-requested 311 impossible pages twice a day.
     */
    if (body.code === 1600300 || /max offset/i.test(message)) lastCallWasRefused = true;
    return null;
  }
  return null;
}

/** Unchanged from the existing importer, so new stock prices consistently with old. */
function priceForCost(costDollars: number): number {
  const multiplier = costDollars <= 10 ? 3.75 : costDollars <= 30 ? 2.75 : costDollars <= 100 ? 2.1 : 1.7;
  return Math.floor(costDollars * multiplier) + 0.99;
}
const toCents = (d: number) => Math.round(d * 100);

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const SLUG_BASE_MAX = 186;
const usedSlugs = new Set<string>();
function uniqueSlug(title: string): string {
  const raw = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || ulid().toLowerCase();
  let base = raw.slice(0, SLUG_BASE_MAX);
  if (raw.length > SLUG_BASE_MAX) {
    const dash = base.lastIndexOf("-");
    if (dash > SLUG_BASE_MAX * 0.6) base = base.slice(0, dash);
  }
  base = base.replace(/-+$/, "") || ulid().toLowerCase();
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
  usedSlugs.add(slug);
  return slug;
}

interface LeafCategory {
  id: string;
  name: string;
  slugPath: [string, string, string];
  cjCategoryId: string;
}

/** A price window narrow enough that all of its results are reachable. */
interface Band { lo: number; hi: number; total: number }

interface Checkpoint {
  /** Pages already consumed, as "lo-hi:page" — a page number alone is ambiguous once there are bands. */
  visited: string[];
  imported: number;
  /** Cached so band discovery, which costs 50 points a probe, is paid once. */
  bands?: Band[];
}

const loadCheckpoint = (): Checkpoint => {
  try {
    const raw = JSON.parse(fs.readFileSync(CHECKPOINT, "utf8"));
    /**
     * The old format recorded bare page numbers against one unpartitioned
     * query. Those numbers mean nothing under banding — page 7 of $20-200 is
     * not page 7 of $30-40 — so they are dropped while the import tally is
     * kept. Re-reading a page is cheap and idempotent; the pid check skips
     * everything already held before any detail call is paid for.
     */
    if (Array.isArray(raw.pages) && !raw.visited) {
      return { visited: [], imported: Number(raw.imported ?? 0) };
    }
    return { visited: raw.visited ?? [], imported: Number(raw.imported ?? 0), bands: raw.bands };
  } catch {
    return { visited: [], imported: 0 };
  }
};
const saveCheckpoint = (cp: Checkpoint) => fs.writeFileSync(CHECKPOINT, JSON.stringify(cp, null, 2));

/** How many products match a price window; null if CJ would not say. */
async function bandTotal(lo: number, hi: number): Promise<number | null> {
  const res = await cjGet<{ total: number }>(`/product/list?pageSize=1&pageNum=1&${priceFilter(lo, hi)}`);
  return res ? Number(res.total ?? 0) : null;
}

/**
 * Splits a price range into windows that each fit under the offset ceiling.
 *
 * Every band is a separate result set with its own 6,000-row window, so nine
 * bands reach ~36,700 products where the single query they replace reached
 * 6,000. Bisected rather than hardcoded because the boundaries that balance
 * today will not balance once stock moves.
 *
 * Costs 50 points per probe, roughly twice the number of bands it returns, and
 * is cached in the checkpoint afterwards.
 */
async function discoverBands(lo: number, hi: number, depth = 0): Promise<Band[]> {
  const total = await bandTotal(lo, hi);
  if (total === null) {
    console.log(`  $${lo}-${hi}: could not read a total, skipped`);
    return [];
  }
  if (total === 0) return [];

  // A band already small enough, or one that cannot be split any finer.
  if (total <= SAFE_BAND_TOTAL || hi - lo <= 1 || depth >= 8) {
    if (total > MAX_OFFSET) {
      // A single dollar of price range holding more than the ceiling. Nothing
      // here can fix that, so say what will be lost rather than lose it quietly.
      console.log(`  $${lo}-${hi}: ${total.toLocaleString()} products but only ${MAX_OFFSET.toLocaleString()} reachable — ${(total - MAX_OFFSET).toLocaleString()} unreachable`);
    }
    return [{ lo, hi, total }];
  }

  const mid = Math.round((lo + hi) / 2);
  return [...(await discoverBands(lo, mid, depth + 1)), ...(await discoverBands(mid, hi, depth + 1))];
}

/** Deterministic shuffle, so a resumed run visits pages in the same order. */
function shuffled<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  console.log(APPLY ? "APPLYING\n" : "DRY RUN — nothing will be written\n");
  console.log(`filters: ${BASE_FILTERS}, price $${MIN_PRICE}-${MAX_PRICE}`);
  console.log(`target : ${TARGET.toLocaleString()} products, up to ${MAX_VARIANTS} variants each\n`);

  // Only leaves our tree already carries, keyed on CJ's own id. A product in a
  // category we do not stock is skipped rather than forced into the nearest
  // looking one — the guessing that mis-filed 66% of the first import.
  const catRows = await db.select().from(schema.categories);
  const byId = new Map(catRows.map((r) => [r.id, r]));
  const leafByCjId = new Map<string, LeafCategory>();
  for (const row of catRows) {
    if (row.level !== "grandchild" || !row.cjCategoryId) continue;
    const child = row.parentId ? byId.get(row.parentId) : undefined;
    const top = child?.parentId ? byId.get(child.parentId) : undefined;
    if (!child || !top) continue;
    leafByCjId.set(row.cjCategoryId, {
      id: row.id,
      name: row.name,
      slugPath: [top.slug, child.slug, row.slug],
      cjCategoryId: row.cjCategoryId,
    });
  }
  console.log(`${leafByCjId.size} leaf categories available to file into`);

  const existing = new Set(
    (
      await db
        .select({ pid: schema.productMeta.cjProductId })
        .from(schema.productMeta)
        .where(and(eq(schema.productMeta.source, "cj"), isNotNull(schema.productMeta.cjProductId)))
    ).map((r) => r.pid).filter((p): p is string => Boolean(p))
  );
  for (const r of await db.select({ slug: schema.products.slug }).from(schema.products)) usedSlugs.add(r.slug);
  console.log(`${existing.size.toLocaleString()} products already imported — they will be skipped`);
  console.log(`${usedSlugs.size.toLocaleString()} slugs already taken\n`);

  const cp = loadCheckpoint();

  let bands = REDISCOVER ? undefined : cp.bands;
  if (!bands?.length) {
    console.log(`discovering price bands under the ${MAX_OFFSET.toLocaleString()}-row offset ceiling...`);
    bands = await discoverBands(MIN_PRICE, MAX_PRICE);
    if (!bands.length) { console.log("could not read the product list"); await pool.end(); return; }
    cp.bands = bands;
    saveCheckpoint(cp);
  }

  const matched = bands.reduce((n, b) => n + b.total, 0);
  const reachable = bands.reduce((n, b) => n + Math.min(b.total, MAX_OFFSET), 0);
  for (const b of bands) {
    console.log(`  $${String(b.lo).padStart(3)}-${String(b.hi).padEnd(3)} ${b.total.toLocaleString().padStart(6)} products`);
  }
  const overflowing = bands.filter((b) => b.total > MAX_OFFSET);
  if (overflowing.length) {
    console.log(`  ${overflowing.length} band(s) exceed the ceiling — re-run with --rediscover to rebalance`);
  }
  console.log(`${bands.length} bands · ${matched.toLocaleString()} products match, ${reachable.toLocaleString()} reachable`);
  console.log(`(one unpartitioned query would reach ${MAX_OFFSET.toLocaleString()})`);

  // Every page of every band, shuffled together rather than band by band, so
  // an interrupted run still leaves the intake spread across the price range
  // instead of complete at the cheap end and empty at the dear one.
  const allPages: { band: Band; page: number }[] = [];
  for (const band of bands) {
    const pages = Math.min(Math.ceil(band.total / PAGE_SIZE), MAX_PAGES_PER_BAND);
    for (let page = 1; page <= pages; page++) allPages.push({ band, page });
  }
  const seen = new Set(cp.visited);
  const order = shuffled(allPages, 20260903).filter((p) => !seen.has(`${p.band.lo}-${p.band.hi}:${p.page}`));
  console.log(`\n${cp.imported.toLocaleString()} imported so far, ${order.length.toLocaleString()} of ${allPages.length.toLocaleString()} pages left to visit`);
  console.log(`estimated ${(Math.max(0, TARGET - cp.imported) * 10 + order.length * 50).toLocaleString()} points remaining\n`);

  if (!APPLY) {
    console.log("Re-run with --apply to write.");
    await pool.end();
    return;
  }

  let imported = cp.imported;
  let skippedCategory = 0;
  let skippedExisting = 0;
  let failedPages = 0;
  // Refused for good (the offset ceiling), as against failed and worth retrying.
  let refusedPages = 0;
  // Counted so a shortfall is visible in the summary rather than having to be
  // inferred from arithmetic afterwards.
  let noDetail = 0;
  let noVariants = 0;

  try {
    for (const { band, page: pageNum } of order) {
      if (imported >= TARGET) break;
      const key = `${band.lo}-${band.hi}:${pageNum}`;

      const page = await cjGet<{ list: CjListItem[] }>(
        `/product/list?pageSize=${PAGE_SIZE}&pageNum=${pageNum}&${priceFilter(band.lo, band.hi)}`
      );
      /**
       * Only a page that actually came back counts as visited — unless CJ
       * refused it outright.
       *
       * Marking a page seen before checking the fetch meant a page that failed
       * transiently was recorded as done and never revisited. Marking a refused
       * page unseen is the opposite mistake: pages past the offset ceiling were
       * re-requested on every run, at 50 points each, for a result that cannot
       * change. Banding should mean this never fires; it is here so that if the
       * ceiling moves, the run costs one wasted page rather than one a day.
       */
      if (!page) {
        if (lastCallWasRefused) { refusedPages++; seen.add(key); } else { failedPages++; }
        continue;
      }
      seen.add(key);
      if (!page.list?.length) continue;

      for (const item of page.list) {
        if (imported >= TARGET) break;
        if (!item.pid || existing.has(item.pid)) { skippedExisting++; continue; }

        const category = item.categoryId ? leafByCjId.get(item.categoryId) : undefined;
        if (!category) { skippedCategory++; continue; }

        const detail = await cjGet<CjDetail>(`/product/query?pid=${item.pid}`);
        existing.add(item.pid);
        if (!detail) { noDetail++; continue; }

        const variants = (detail.variants ?? []).slice(0, MAX_VARIANTS);
        if (variants.length === 0) { noVariants++; continue; }

        const description = stripHtml(detail.description).slice(0, 2000) || (detail.productNameEn ?? "");
        const title = detail.productNameEn ?? item.productNameEn ?? "";
        if (!title.trim()) continue;

        let wroteAny = false;
        for (const v of variants) {
          const costDollars = Number(v.variantSellPrice ?? item.sellPrice ?? 0);
          if (!costDollars || costDollars <= 0) continue;
          const images = [
            ...new Set(
              [v.variantImage, detail.bigImage, item.productImage, ...(detail.productImageSet ?? [])].filter(Boolean)
            ),
          ].slice(0, 6) as string[];
          if (images.length === 0) continue;

          const sellPrice = priceForCost(costDollars);
          const productId = ulid();
          try {
            await db.insert(schema.products).values({
              id: productId,
              slug: uniqueSlug(title),
              title,
              variantGroupId: item.pid,
              variantLabel: v.variantKey && v.variantKey !== title ? v.variantKey : null,
              brandId: GENERIC_BRAND_ID,
              priceCents: toCents(sellPrice),
              originalPriceCents: null,
              currency: "USD",
              images,
              ratingValue: "0",
              ratingCount: 0,
              categoryId: category.id,
              categorySlugPath: category.slugPath,
              isNewArrival: true,
              freeShipping: sellPrice >= 50,
              stock: NOMINAL_STOCK,
              description,
              features: [],
            });
            await db.insert(schema.productMeta).values({
              productId,
              source: "cj",
              costCents: toCents(costDollars),
              status: "active",
              visibility: "visible",
              cjProductId: item.pid,
              cjVariantId: v.vid,
              cjCategoryId: category.cjCategoryId,
              cjCategoryPath: category.name.slice(0, 255),
              cjSourceWarehouse: "US",
              cjStockStatus: "in_stock",
            });
            await db.insert(schema.inventory).values({
              sku: v.variantSku ? `CJ-${v.variantSku}` : `CJ-${ulid()}`,
              productId,
              source: "cj",
              warehouse: "CJ Warehouse (US)",
              available: NOMINAL_STOCK,
              reserved: 0,
              incoming: 0,
              status: "in_stock",
            });
            wroteAny = true;
          } catch (err) {
            console.error(`  [skip] ${item.pid} variant ${v.vid}: ${(err as Error).message.slice(0, 90)}`);
          }
        }

        if (wroteAny) imported++;
        if (imported % 100 === 0 && wroteAny) {
          saveCheckpoint({ visited: [...seen], imported, bands });
          console.log(`  ${imported.toLocaleString()}/${TARGET.toLocaleString()} products · points ${points.used}/${points.total}`);
        }
      }
      saveCheckpoint({ visited: [...seen], imported, bands });
    }
  } catch (err) {
    saveCheckpoint({ visited: [...seen], imported, bands });
    if (err instanceof QuotaExceededError) {
      console.log(`\nStopped: ${err.message}`);
      console.log("Progress is checkpointed — re-run to continue.");
      await pool.end();
      process.exit(0);
    }
    throw err;
  }

  saveCheckpoint({ visited: [...seen], imported, bands });
  console.log(`\nimported ${imported.toLocaleString()} products`);
  console.log(`  skipped, already held        : ${skippedExisting.toLocaleString()}`);
  console.log(`  skipped, category not stocked: ${skippedCategory.toLocaleString()}`);
  console.log(`  skipped, no detail from CJ   : ${noDetail.toLocaleString()}`);
  console.log(`  skipped, no variants         : ${noVariants.toLocaleString()}`);
  console.log(`  pages that failed to fetch   : ${failedPages.toLocaleString()} (will be retried)`);
  console.log(`  pages refused past the cap   : ${refusedPages.toLocaleString()} (will not be retried)`);
  console.log(`  points used                  : ${points.used}/${points.total}`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
