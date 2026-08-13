/**
 * Sources real CJ products for leaf categories that CJ's own taxonomy can't
 * reach.
 *
 * scripts/import-cj-products.ts sweeps CJ's category tree and maps each CJ
 * leaf onto ours. That leaves a permanent hole: our tree has 1,416 leaves and
 * CJ's has roughly 540, so more than half of ours were never a destination
 * for anything. "Stacking Toys" gets nothing because CJ has no such category
 * — not because CJ sells no stacking toys.
 *
 * So this searches by NAME instead of by category, the way a human sourcer
 * would: take the leaf ("Yarn Bowls"), search CJ's catalogue for it, and keep
 * the results that genuinely are that thing.
 *
 * The "genuinely" is the whole job. CJ's keyword search is loose and will
 * happily return a phone case for "palette knife", so every candidate is
 * checked against the leaf's own distinctive words before its detail is even
 * fetched — which also keeps API spend down, since validation happens on the
 * cheap list response rather than after a per-product query. The failure this
 * guards against is real and already documented in
 * scripts/fix-cj-categories.ts: an earlier pass filed a "Car Ghost Claw
 * Sticker" under "Beading Thread".
 *
 * A leaf with no genuine match is left empty and reported. Filling it with
 * something irrelevant would be worse than empty — it misleads shoppers and,
 * per google_index.md, is exactly the thin-content pattern that damages a
 * store's standing in search.
 *
 * Knobs: SOURCE_PRODUCTS_PER_LEAF (default 4 distinct products),
 * SOURCE_MAX_VARIANTS (default 2), SOURCE_MAX_LEAVES (default unlimited),
 * SOURCE_DRY_RUN=1 (search and validate, write nothing).
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import fs from "node:fs";
import * as schema from "../db/schema";
import { newId } from "../lib/id";
import { slugify } from "../lib/slugify";
import { toCents } from "../lib/money";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const PRODUCTS_PER_LEAF = Number(process.env.SOURCE_PRODUCTS_PER_LEAF ?? 4);
const MAX_VARIANTS_PER_PRODUCT = Number(process.env.SOURCE_MAX_VARIANTS ?? 2);
const MAX_LEAVES = Number(process.env.SOURCE_MAX_LEAVES ?? Infinity);
const DRY_RUN = process.env.SOURCE_DRY_RUN === "1";
const CHECKPOINT_FILE = new URL("./.cj-source-checkpoint.json", import.meta.url);
const REPORT_FILE = new URL("./.cj-source-report.json", import.meta.url);
const GENERIC_BRAND_ID = "cj-marketplace";

class QuotaExceededError extends Error {}

// ---------------------------------------------------------------------------
// CJ API client — mirrors scripts/import-cj-products.ts deliberately; see the
// note there about not reusing lib/cj-provider.ts, which is "server-only".
// ---------------------------------------------------------------------------

/**
 * Search uses /product/list, NOT /product/listV2.
 *
 * listV2 accepts a productNameEn parameter and silently ignores it — probed
 * directly, "dress" and "marker" both returned the same unrelated "Temporary
 * Metal Waterproof Key Box". /product/list actually filters, and pages with
 * pageNum/pageSize rather than page/size. Its items are keyed `pid` and
 * `productNameEn`, where listV2's are `id` and `nameEn`; reading the wrong
 * one yields an empty title, which silently fails every match.
 */
interface CjListItem {
  pid: string;
  productNameEn?: string;
  productName?: string;
}
interface CjListResponse {
  list?: CjListItem[];
  total?: number;
}
interface CjVariant {
  vid: string;
  variantKey?: string;
  variantSku?: string;
  variantImage?: string;
  variantSellPrice?: string | number;
}
interface CjProductDetail {
  pid: string;
  productNameEn: string;
  description?: string;
  bigImage?: string;
  productImageSet?: string[];
  sellPrice?: string | number;
  variants?: CjVariant[];
}
interface CjStockResponse {
  variantInventories?: { vid: string; inventory?: { totalInventory?: number | string }[] }[];
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.accessToken;
  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const body = await res.json();
  if (!body.result) throw new Error(`CJ authentication failed: ${body.message}`);
  cachedToken = { accessToken: body.data.accessToken, expiresAt: new Date(body.data.accessTokenExpiryDate).getTime() };
  return cachedToken.accessToken;
}

/**
 * CJ enforces 1 request per second, not the 100 QPS that
 * scripts/import-cj-products.ts assumes — its 200ms gap and the comment
 * claiming headroom are both wrong. Measured here: a 200ms gap gets
 * "Too Many Requests, QPS limit is 1 time/1second" almost immediately.
 */
const MIN_CALL_GAP_MS = 1100;

/** Rate limiting is temporary and must be retried. Running out of daily points is not. */
function isRateLimit(body: { code?: number; message?: string }, status: number): boolean {
  return status === 429 || /too many requests|qps limit/i.test(body.message ?? "");
}
function isPointsExhausted(body: { code?: number; message?: string }): boolean {
  // 16900500 is CJ's real code for it; the message text doesn't say so, which
  // once let a whole run retry itself to death.
  return body.code === 16900500 || /insufficient.*points|quota/i.test(body.message ?? "");
}

let lastCallAt = 0;
let lastPointsLogAt = 0;
async function cjGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = `${CJ_BASE}${path}?${new URLSearchParams(params).toString()}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const wait = Math.max(0, lastCallAt + MIN_CALL_GAP_MS - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();

    const res = await fetch(url, { headers: { "CJ-Access-Token": await getAccessToken() } });
    const body = await res.json();

    if (body.pointsInfo && Date.now() - lastPointsLogAt > 60_000) {
      console.log(`  (points: used ${body.pointsInfo.usedToday}/${body.pointsInfo.total} today)`);
      lastPointsLogAt = Date.now();
    }
    if (body.result ?? body.success) return body.data;

    if (isPointsExhausted(body)) throw new QuotaExceededError(body.message);
    if (isRateLimit(body, res.status) || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      continue;
    }
    throw new Error(`CJ GET ${path} failed: ${body.message} (code ${body.code})`);
  }
  throw new Error(`CJ GET ${path} failed after retries: ${url}`);
}

// ---------------------------------------------------------------------------
// Matching — the part that decides whether a search hit is really the thing
// ---------------------------------------------------------------------------

function words(s: string): string[] {
  // >= 3 chars: a 1-2 character token is a substring of nearly any word and
  // silently wins matches for unrelated categories. Same reasoning, and the
  // same live failure, as scripts/import-cj-products.ts.
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
}

const INFLECTION_SUFFIXES = new Set(["", "s", "es"]);
function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  if (!longer.startsWith(shorter)) return false;
  return INFLECTION_SUFFIXES.has(longer.slice(shorter.length));
}

/**
 * Words that appear across half the catalogue and so discriminate nothing.
 * A leaf whose name is entirely these ("Other Accessories") can't be matched
 * on its own name and borrows its parent's words instead.
 */
const GENERIC = new Set([
  "accessories", "accessory", "other", "others", "supplies", "supply", "parts", "part",
  "sets", "set", "kits", "kit", "products", "product", "items", "item", "gear",
  "equipment", "essentials", "general", "misc", "miscellaneous", "and", "the", "for",
]);

function distinctive(name: string): string[] {
  return words(name).filter((w) => !GENERIC.has(w));
}

/**
 * Every distinctive word of the leaf must appear in the title.
 *
 * ALL rather than ANY: "Palette Knives" matching on "knives" alone returns
 * kitchen knives, and "Yarn Bowls" on "bowls" returns soup bowls. Requiring
 * the full phrase is strict enough to leave some leaves empty, which is the
 * intended trade — a wrong product in a category is worse than none.
 */
function titleMatchesLeaf(title: string, required: string[]): boolean {
  if (required.length === 0) return false;
  const tw = words(title);

  const positions = required.map((rw) => {
    const found: number[] = [];
    tw.forEach((t, i) => {
      if (wordsMatch(t, rw)) found.push(i);
    });
    return found;
  });
  if (positions.some((p) => p.length === 0)) return false;
  if (required.length === 1) return true;

  /**
   * The words must also sit close together.
   *
   * Presence alone is far too weak against CJ's twenty-word titles: "Women
   * Bike, 26 In Beach Cruiser Bike, 7-Speed Adult City Bicycle With Carbon
   * Steel Rack" contains both "bike" and "rack" and is a bicycle, not a bike
   * rack. Requiring them within a short window is what separates "Bike
   * Storage Rack" from a bicycle that merely mentions a rack. Verified
   * against live search results — both of those came back for "bike racks".
   */
  const span = minWindowSpan(positions);
  return span <= required.length + 2;
}

/** Narrowest span containing one position from every list. Brute force is fine — leaf names are 2-4 words. */
function minWindowSpan(positions: number[][]): number {
  let best = Infinity;
  const walk = (index: number, lo: number, hi: number) => {
    if (index === positions.length) {
      best = Math.min(best, hi - lo);
      return;
    }
    for (const p of positions[index]) {
      const nextLo = Math.min(lo, p);
      const nextHi = Math.max(hi, p);
      if (nextHi - nextLo >= best) continue; // already worse than the best found
      walk(index + 1, nextLo, nextHi);
    }
  };
  walk(0, Infinity, -Infinity);
  return best;
}

interface EmptyLeaf {
  id: string;
  name: string;
  childName: string;
  topName: string;
  topSlug: string;
  childSlug: string;
  grandchildSlug: string;
}

/**
 * Search terms to try, most specific first.
 *
 * A sourcer doesn't give up when the exact phrase returns nothing — they
 * widen. "Sewing Machine Accessories" yields little; "sewing machine" yields
 * plenty, and the validator still insists the result is about sewing
 * machines. The parent category joins in when the leaf's own name is too
 * generic to search on.
 */
function queriesFor(leaf: EmptyLeaf): string[] {
  const leafWords = distinctive(leaf.name);
  const childWords = distinctive(leaf.childName);
  const out: string[] = [];

  if (leafWords.length > 0) {
    out.push(leafWords.join(" "));
    // Drop the qualifier and keep the head noun: "Palette Knives" -> "knives"
    // is too broad, but "Sewing Machine Accessories" -> "sewing machine" is
    // exactly right, so this only fires with 3+ words.
    if (leafWords.length >= 3) out.push(leafWords.slice(0, -1).join(" "));
  }
  // Generic leaf names ("Other Accessories") only mean anything with the
  // parent attached.
  if (leafWords.length === 0 && childWords.length > 0) out.push(childWords.join(" "));
  else if (childWords.length > 0) out.push(`${childWords[0]} ${leafWords[leafWords.length - 1] ?? ""}`.trim());

  return [...new Set(out.filter(Boolean))];
}

/** The words a title must contain — the leaf's own, or its parent's if the leaf is generic. */
function requiredWords(leaf: EmptyLeaf): string[] {
  const leafWords = distinctive(leaf.name);
  return leafWords.length > 0 ? leafWords : distinctive(leaf.childName);
}

// ---------------------------------------------------------------------------
// Writing — shape copied exactly from scripts/import-cj-products.ts so
// sourced products are indistinguishable from swept ones downstream.
// ---------------------------------------------------------------------------

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

function computeInventoryStatus(available: number, incoming: number): "in_stock" | "low_stock" | "out_of_stock" | "backorder" {
  if (available === 0) return incoming > 0 ? "backorder" : "out_of_stock";
  return available <= 9 ? "low_stock" : "in_stock";
}

function priceForCost(costDollars: number): number {
  const multiplier = costDollars <= 10 ? 3.75 : costDollars <= 30 ? 2.75 : costDollars <= 100 ? 2.1 : 1.7;
  return Math.floor(costDollars * multiplier) + 0.99;
}

// products.slug is varchar(191) and products.title varchar(255). CJ titles
// routinely exceed both — the first live run died on a 196-character slug
// from "Multi-piece Party Value Packs, 7-Piece Stainless Steel Putty Knife
// Set: Putty Knives, Plastering Knives, And Palette Knives...". Room is left
// under the slug limit for the "-2" disambiguation suffix.
const SLUG_MAX = 180;
const TITLE_MAX = 255;

const usedSlugs = new Set<string>();
function uniqueSlug(title: string): string {
  const full = slugify(title) || newId().toLowerCase();
  // Trimmed at a word boundary so the slug stays readable rather than
  // ending mid-word.
  const base = full.length <= SLUG_MAX ? full : full.slice(0, SLUG_MAX).replace(/-[^-]*$/, "");
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  usedSlugs.add(slug);
  return slug;
}

function fitTitle(title: string): string {
  if (title.length <= TITLE_MAX) return title;
  return title.slice(0, TITLE_MAX - 1).replace(/[\s,:-]+$/, "") + "…";
}

async function importVariant(
  baseProduct: CjProductDetail,
  variant: CjVariant,
  stockByVid: Map<string, number>,
  leaf: EmptyLeaf
): Promise<boolean> {
  const costDollars = Number(variant.variantSellPrice ?? baseProduct.sellPrice ?? 0);
  if (!costDollars || costDollars <= 0) return false;

  const available = Math.max(0, Math.floor(stockByVid.get(variant.vid) ?? 0));
  const title =
    variant.variantKey && variant.variantKey !== baseProduct.productNameEn
      ? `${baseProduct.productNameEn} - ${variant.variantKey}`
      : baseProduct.productNameEn;

  const images = [
    ...new Set([variant.variantImage, baseProduct.bigImage, ...(baseProduct.productImageSet ?? [])].filter((x): x is string => Boolean(x))),
  ].slice(0, 6);
  if (images.length === 0) return false;

  const productId = newId();
  const sellPrice = priceForCost(costDollars);
  // Slug derives from the full title before trimming, so two products whose
  // titles only differ past the cut-off still get distinct slugs.
  const slug = uniqueSlug(title);

  await db.insert(schema.products).values({
    id: productId,
    slug,
    title: fitTitle(title),
    brandId: GENERIC_BRAND_ID,
    priceCents: toCents(sellPrice),
    originalPriceCents: null,
    currency: "USD",
    images,
    ratingValue: "0",
    ratingCount: 0,
    categoryId: leaf.id,
    categorySlugPath: [leaf.topSlug, leaf.childSlug, leaf.grandchildSlug],
    isNewArrival: true,
    isBestSeller: false,
    isTrending: false,
    isFlashSale: false,
    isDeal: false,
    freeShipping: sellPrice >= 50,
    stock: available,
    description: stripHtml(baseProduct.description).slice(0, 2000) || title,
    features: [],
  });

  await db.insert(schema.productMeta).values({
    productId,
    source: "cj",
    costCents: toCents(costDollars),
    status: "active",
    visibility: "visible",
    cjProductId: baseProduct.pid,
    cjVariantId: variant.vid,
    cjSourceWarehouse: "CN",
    cjStockStatus: available > 0 ? "in_stock" : "out_of_stock",
  });

  await db.insert(schema.inventory).values({
    sku: variant.variantSku ? `CJ-${variant.variantSku}` : `CJ-${newId()}`,
    productId,
    source: "cj",
    warehouse: "CJ Warehouse (CN)",
    available,
    reserved: 0,
    incoming: 0,
    status: computeInventoryStatus(available, 0),
  });

  return true;
}

// ---------------------------------------------------------------------------

async function loadEmptyLeaves(): Promise<EmptyLeaf[]> {
  const rows = await db.select().from(schema.categories);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const products = await db.select({ path: schema.products.categorySlugPath }).from(schema.products);

  const filled = new Set<string>();
  for (const p of products) {
    const path = p.path as string[] | null;
    if (Array.isArray(path) && path.length === 3) filled.add(path.join("/"));
  }

  const leaves: EmptyLeaf[] = [];
  for (const row of rows) {
    if (row.level !== "grandchild") continue;
    const child = row.parentId ? byId.get(row.parentId) : undefined;
    const top = child?.parentId ? byId.get(child.parentId) : undefined;
    if (!child || !top) continue;
    if (filled.has([top.slug, child.slug, row.slug].join("/"))) continue;
    leaves.push({
      id: row.id,
      name: row.name,
      childName: child.name,
      topName: top.name,
      topSlug: top.slug,
      childSlug: child.slug,
      grandchildSlug: row.slug,
    });
  }
  return leaves;
}

async function ensureGenericBrand(): Promise<void> {
  const [existing] = await db.select().from(schema.brands).where(eq(schema.brands.id, GENERIC_BRAND_ID)).limit(1);
  if (existing) return;
  await db.insert(schema.brands).values({ id: GENERIC_BRAND_ID, name: "Cartebay Marketplace", slug: "cartebay-marketplace", categorySlugs: [] });
}

interface Checkpoint {
  doneLeafIds: string[];
  filled: number;
  listings: number;
  unfilled: { path: string; tried: string[] }[];
}

function loadCheckpoint(): Checkpoint {
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8"));
  } catch {
    return { doneLeafIds: [], filled: 0, listings: 0, unfilled: [] };
  }
}

async function main() {
  const leaves = (await loadEmptyLeaves()).slice(0, MAX_LEAVES);
  console.log(`${leaves.length} empty leaf categories to source for`);
  console.log(`target ${PRODUCTS_PER_LEAF} distinct products each, up to ${MAX_VARIANTS_PER_PRODUCT} variants${DRY_RUN ? "  [DRY RUN — nothing will be written]" : ""}\n`);

  if (!DRY_RUN) await ensureGenericBrand();

  const seenPids = new Set(
    (await db.select({ pid: schema.productMeta.cjProductId }).from(schema.productMeta))
      .map((r) => r.pid)
      .filter((p): p is string => Boolean(p))
  );
  console.log(`${seenPids.size} CJ products already in the catalogue — these won't be re-used\n`);

  const cp = loadCheckpoint();
  const done = new Set(cp.doneLeafIds);

  try {
    for (const leaf of leaves) {
      if (done.has(leaf.id)) continue;
      const path = `${leaf.topName} > ${leaf.childName} > ${leaf.name}`;
      const required = requiredWords(leaf);
      const tried = queriesFor(leaf);

      let importedHere = 0;
      let listingsHere = 0;

      for (const query of tried) {
        if (importedHere >= PRODUCTS_PER_LEAF) break;

        let list: CjListItem[] = [];
        try {
          const data = await cjGet<CjListResponse>("/product/list", {
            productNameEn: query,
            pageNum: "1",
            pageSize: "60",
          });
          list = data?.list ?? [];
        } catch (err) {
          if (err instanceof QuotaExceededError) throw err;
          console.error(`  [skip] search "${query}" failed: ${(err as Error).message}`);
          continue;
        }

        for (const item of list) {
          if (importedHere >= PRODUCTS_PER_LEAF) break;
          if (seenPids.has(item.pid)) continue;
          const name = item.productNameEn ?? item.productName ?? "";
          // Validated on the cheap list response, before spending a detail call.
          if (!titleMatchesLeaf(name, required)) continue;

          let detail: CjProductDetail;
          try {
            detail = await cjGet<CjProductDetail>("/product/query", { pid: item.pid });
          } catch (err) {
            if (err instanceof QuotaExceededError) throw err;
            continue;
          }
          const variants = (detail.variants ?? []).slice(0, MAX_VARIANTS_PER_PRODUCT);
          if (variants.length === 0) continue;

          const stockByVid = new Map<string, number>();
          try {
            const stock = await cjGet<CjStockResponse>("/product/stock/getInventoryByPid", { pid: item.pid });
            for (const entry of stock.variantInventories ?? []) {
              stockByVid.set(entry.vid, (entry.inventory ?? []).reduce((s, i) => s + Number(i.totalInventory ?? 0), 0));
            }
          } catch (err) {
            if (err instanceof QuotaExceededError) throw err;
          }

          seenPids.add(item.pid);
          // The matched title is the only way to judge sourcing quality, so a
          // dry run prints it — counts alone can't tell a palette knife from
          // a sushi knife.
          if (DRY_RUN) console.log(`      · ${name.slice(0, 80)}`);
          let wroteAny = false;
          for (const variant of variants) {
            if (DRY_RUN) {
              wroteAny = true;
              listingsHere++;
              continue;
            }
            try {
              if (await importVariant(detail, variant, stockByVid, leaf)) {
                wroteAny = true;
                listingsHere++;
              }
            } catch (err) {
              // One rejected row must not end an unattended multi-hour run —
              // the first live attempt died entirely on a single over-length
              // slug, 8 leaves in.
              console.error(`  [skip] insert failed for ${detail.pid}: ${(err as Error).message.slice(0, 120)}`);
            }
          }
          if (wroteAny) importedHere++;
        }
      }

      if (importedHere > 0) {
        cp.filled++;
        cp.listings += listingsHere;
        console.log(`  ✓ ${path} — ${importedHere} products / ${listingsHere} listings  [${tried[0]}]`);
      } else {
        cp.unfilled.push({ path, tried });
        console.log(`  · ${path} — nothing genuine found  [tried: ${tried.join(" | ")}]`);
      }

      cp.doneLeafIds.push(leaf.id);
      if (!DRY_RUN) fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, null, 2));
    }
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      console.error(`\nStopped: CJ API points exhausted (${err.message}). Re-run tomorrow — progress is checkpointed.`);
    } else {
      throw err;
    }
  }

  fs.writeFileSync(REPORT_FILE, JSON.stringify(cp, null, 2));
  console.log(`\nFilled ${cp.filled} leaves with ${cp.listings} listings. ${cp.unfilled.length} still empty.`);
  console.log(`Report: ${REPORT_FILE.pathname}`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
