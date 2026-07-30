/**
 * Real-catalog import from CJdropshipping — real products, real variants
 * (each stored as its own storefront listing per the chosen approach; no
 * product_variants table/UI exists in this app), real category mapping onto
 * this site's existing tree.
 *
 * Run with: npx tsx scripts/import-cj-products.ts
 *
 * Additive and duplicate-safe: loads every already-imported CJ product id
 * from product_meta at startup and skips them, so re-running (e.g. to widen
 * category coverage after the first pass) only pulls genuinely new
 * products — never re-inserts or duplicates what's already there.
 *
 * Targets breadth over depth: PRODUCTS_PER_LEAF distinct base products per
 * CJ leaf category, capped at MAX_VARIANTS_PER_PRODUCT variants each — not
 * a fixed total listing count. Reaching more of this site's 1,416
 * category leaves (CJ's own taxonomy only has ~540) depends on distinct
 * product titles to match against, not on more colors of the same item.
 *
 * Resumable: writes progress to scripts/.cj-import-checkpoint.json after
 * every CJ leaf category it finishes, and skips categories already marked
 * done on a re-run (a crash/interrupt loses at most one in-progress
 * category, not the whole run). Delete that file to start a fresh full
 * sweep instead of resuming.
 *
 * Dev knobs: CJ_IMPORT_PRODUCTS_PER_LEAF (default 25), CJ_IMPORT_MAX_VARIANTS
 * (default 2), CJ_IMPORT_MAX_PAGES (default 4), CJ_IMPORT_TARGET (a total
 * safety cap, default 100000 — not the primary target), CJ_IMPORT_MAX_LEAVES
 * (default unlimited — caps how many CJ leaf categories are swept, for
 * smoke tests).
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
// Distinct BASE products per CJ leaf category — not listings. The first
// import pass targeted a fixed total listing count and let variants
// (colors/sizes of the same item) count toward it, which favored depth
// (many colors of few products) over breadth (many distinct product
// types) — and breadth is what actually reaches more of our finer-grained
// category tree (1,416 leaves vs. CJ's own 540), since matching runs per
// distinct product title. This pass targets breadth directly.
const PRODUCTS_PER_LEAF = Number(process.env.CJ_IMPORT_PRODUCTS_PER_LEAF ?? 25);
const MAX_VARIANTS_PER_PRODUCT = Number(process.env.CJ_IMPORT_MAX_VARIANTS ?? 2);
const TOTAL_SAFETY_CAP = Number(process.env.CJ_IMPORT_TARGET ?? 100000); // guards against runaway behavior, not the primary target
const MAX_PAGES_PER_LEAF = Number(process.env.CJ_IMPORT_MAX_PAGES ?? 4); // 100/page — bounds worst-case work per leaf
const MAX_LEAVES = Number(process.env.CJ_IMPORT_MAX_LEAVES ?? Infinity); // dev/smoke-test knob
const CHECKPOINT_FILE = new URL("./.cj-import-checkpoint.json", import.meta.url);
const GENERIC_BRAND_ID = "cj-marketplace";

class QuotaExceededError extends Error {}

// Minimal shapes for the CJ Open API fields this script actually reads —
// see the doc comment at the top of each usage site for the source
// endpoint. Not an exhaustive types package; CJ doesn't publish one.
interface CjListItem {
  id: string;
}
interface CjVariant {
  vid: string;
  variantKey?: string;
  variantSellPrice?: number | string;
  variantImage?: string;
  variantSku?: string;
}
interface CjProductDetail {
  pid: string;
  productNameEn: string;
  sellPrice?: number | string;
  bigImage?: string;
  productImageSet?: string[];
  description?: string;
  variants?: CjVariant[];
}
interface CjStockInventoryEntry {
  totalInventory?: number | string;
}
interface CjStockVariant {
  vid: string;
  inventory?: CjStockInventoryEntry[];
}
interface CjStockResponse {
  variantInventories?: CjStockVariant[];
}
interface CjCategoryLeaf {
  categoryId: string;
  categoryName: string;
}
interface CjCategoryMid {
  categorySecondName: string;
  categorySecondList?: CjCategoryLeaf[];
}
interface CjCategoryTop {
  categoryFirstName: string;
  categoryFirstList?: CjCategoryMid[];
}
interface CjListResponse {
  content?: { productList?: CjListItem[] }[];
  list?: CjListItem[];
}

// ---------------------------------------------------------------------------
// CJ API client (standalone — not lib/cj-provider.ts, which is "server-only"
// and shaped for the Next.js app; this mirrors its auth logic directly, same
// reasoning as scripts/seed-db.ts using its own DB connection instead of
// db/index.ts).
// ---------------------------------------------------------------------------

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

let lastCallAt = 0;
let lastPointsLogAt = 0;
async function throttle(): Promise<void> {
  const wait = Math.max(0, lastCallAt + 200 - Date.now()); // ~5 req/s — well under the 100 QPS ceiling, polite to a shared third-party API
  if (wait) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

async function cjGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const url = `${CJ_BASE}${path}${qs ? `?${qs}` : ""}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    await throttle();
    const token = await getAccessToken();
    const res = await fetch(url, { headers: { "CJ-Access-Token": token } });
    const body = await res.json();

    // CJ's daily points budget shows up on some responses (pointsInfo) —
    // its exact per-call cost isn't documented, so this is monitored rather
    // than pre-computed; logged occasionally so a long run's console output
    // shows the trend instead of every single call.
    if (body.pointsInfo && Date.now() - lastPointsLogAt > 30_000) {
      console.log(`  (points: used ${body.pointsInfo.usedToday}/${body.pointsInfo.total} today)`);
      lastPointsLogAt = Date.now();
    }

    if (body.result ?? body.success) return body.data;
    // code 16900500 is CJ's real "Insufficient API points" response (verified
    // live — the message text itself doesn't contain "quota"/"limit exceeded"
    // at all, so matching on message alone missed this and the script kept
    // retrying every call for the rest of the run instead of stopping).
    if (body.code === 16900500 || /quota|insufficient.*points|limit exceeded|too many requests/i.test(body.message ?? "")) {
      throw new QuotaExceededError(body.message);
    }
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    throw new Error(`CJ GET ${path} failed: ${body.message} (code ${body.code})`);
  }
  throw new Error(`CJ GET ${path} failed after retries: ${url}`);
}

// ---------------------------------------------------------------------------
// Helpers
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

/**
 * Tiered markup off CJ's real cost — cheaper items need a fatter multiple to
 * cover fixed per-order overhead (packaging, payment processing, support);
 * rounded to a .99 psychological price point.
 */
function priceForCost(costDollars: number): number {
  const multiplier = costDollars <= 10 ? 3.75 : costDollars <= 30 ? 2.75 : costDollars <= 100 ? 2.1 : 1.7;
  return Math.floor(costDollars * multiplier) + 0.99;
}

const usedSlugs = new Set<string>();
function uniqueSlug(title: string): string {
  const base = slugify(title) || newId().toLowerCase();
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  usedSlugs.add(slug);
  return slug;
}

interface LeafCategory {
  id: string;
  name: string;
  topSlug: string;
  topName: string;
  childSlug: string;
  grandchildSlug: string;
}

async function loadLeafCategories(): Promise<LeafCategory[]> {
  const rows = await db.select().from(schema.categories);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const leaves: LeafCategory[] = [];
  for (const row of rows) {
    if (row.level !== "grandchild") continue;
    const child = row.parentId ? byId.get(row.parentId) : undefined;
    const top = child?.parentId ? byId.get(child.parentId) : undefined;
    if (!child || !top) continue;
    leaves.push({ id: row.id, name: row.name, topSlug: top.slug, topName: top.name, childSlug: child.slug, grandchildSlug: row.slug });
  }
  console.log(`Loaded ${leaves.length} leaf categories from the existing tree`);
  return leaves;
}

function words(s: string): string[] {
  // Length >= 3 filters out noise tokens from possessives/hyphenation
  // ("Women's" -> "women" + a bare "s"; "E-Readers" -> a bare "e" +
  // "readers") — a 1-2 character token matches almost any word under
  // substring-containment scoring ("e" is a substring of nearly every
  // English word), which was silently winning matches for completely
  // unrelated categories (verified: "Face Masks" matched "E-Readers"
  // solely because bare "e" is a substring of "face").
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
}

/**
 * Fraction of `leafWords` that appear (exactly, or as a substring of a
 * segment word — "hat" inside "hats") somewhere in `segmentWords`. Plain
 * word overlap, not Fuse: our leaf names are short controlled vocabulary
 * ("Hats", "Gloves", "Scarves") and CJ's segment names are longer
 * descriptive phrases ("Woman Hats & Caps") — Fuse's fuzzy edit-distance
 * search is built for a short query against long documents, the opposite
 * direction, and scored short-vs-long matches poorly even for obviously
 * related terms (verified: "Hats" vs "Woman Hats & Caps" scored as no
 * match at threshold 0.5, despite the exact word being present).
 */
function overlapScore(leafWords: string[], segmentWords: string[]): number {
  if (leafWords.length === 0) return 0;
  let matched = 0;
  for (const lw of leafWords) {
    if (segmentWords.some((sw) => sw === lw || sw.includes(lw) || lw.includes(sw))) matched++;
  }
  return matched / leafWords.length;
}

/**
 * Matches a CJ leaf category (known reliably from the sweep loop itself,
 * unlike the per-product categoryName field, which is frequently empty) onto
 * our existing category tree.
 *
 * Top-level first, then narrow: matching CJ's most specific leaf/child name
 * against the ENTIRE ~1400-leaf universe directly was tried first and
 * rejected — a generic word shared across domains (e.g. "Accessories"
 * appears under both "Women's Clothing" and "Automotive & Powersports") let
 * an unrelated leaf from a totally different top category win.
 *
 * The top-level match is word-overlap (not Fuse) too, for the same reason
 * as the leaf level — and it's pooled, not winner-take-all: a compound CJ
 * top like "Home, Garden & Furniture" has no single 1:1 match in our tree
 * (which splits Home & Kitchen / Furniture / Garden & Outdoor Living into
 * three separate tops), so every one of our tops sharing ANY word with it
 * contributes its leaves to the candidate pool, rather than committing to
 * whichever single top scores best (verified: committing to one caused
 * everything under a compound CJ top to collapse onto one arbitrary leaf of
 * whichever unrelated top Fuse happened to prefer).
 */
function matchCjLeafToOurTree(
  cjLeaf: { name: string; path: string },
  leavesByTopSlug: Map<string, LeafCategory[]>,
  ultimateFallback: LeafCategory
): LeafCategory {
  const segments = cjLeaf.path.split(">").map((s) => s.trim()).filter(Boolean);
  const cjTopWords = words(segments[0]);

  const topScores = [...leavesByTopSlug.entries()]
    .map(([topSlug, leaves]) => ({ topSlug, leaves, score: overlapScore(words(leaves[0].topName), cjTopWords) }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);
  if (topScores.length === 0) return ultimateFallback;

  const candidates = topScores.flatMap((t) => t.leaves);
  const bestTopFallback = topScores[0].leaves[0];

  for (const segment of segments.slice(1).reverse()) {
    const segmentWords = words(segment);
    let best: { leaf: LeafCategory; score: number } | null = null;
    for (const leaf of candidates) {
      const score = overlapScore(words(leaf.name), segmentWords);
      if (score > 0 && (!best || score > best.score)) best = { leaf, score };
    }
    if (best && best.score >= 0.5) return best.leaf;
  }
  return bestTopFallback;
}

async function ensureGenericBrand(): Promise<void> {
  const [existing] = await db.select().from(schema.brands).where(eq(schema.brands.id, GENERIC_BRAND_ID)).limit(1);
  if (existing) return;
  // Deliberately NOT one of the existing 90 real-name brands (Adidas, Apple,
  // ...) — those are this project's fictional storefront brand catalog, and
  // attributing genuine CJ dropshipped generic goods to a real trademark
  // would be a false, potentially trademark-infringing claim. One honest,
  // generic brand for every CJ-sourced import instead.
  await db.insert(schema.brands).values({ id: GENERIC_BRAND_ID, name: "Baruashop Marketplace", slug: "baruashop-marketplace", categorySlugs: [] });
  console.log("Created generic brand: Baruashop Marketplace");
}

// ---------------------------------------------------------------------------
// Checkpoint
// ---------------------------------------------------------------------------

interface Checkpoint {
  doneLeafIds: string[];
  totalImported: number;
}

function loadCheckpoint(): Checkpoint {
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8"));
  } catch {
    return { doneLeafIds: [], totalImported: 0 };
  }
}

function saveCheckpoint(cp: Checkpoint): void {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, null, 2));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function importVariant(
  baseProduct: CjProductDetail,
  variant: CjVariant,
  stockByVid: Map<string, number>,
  category: LeafCategory
): Promise<boolean> {
  const costDollars = Number(variant.variantSellPrice ?? baseProduct.sellPrice ?? 0);
  if (!costDollars || costDollars <= 0) return false;

  const available = Math.max(0, Math.floor(stockByVid.get(variant.vid) ?? 0));
  const countryCode: "CN" | "US" = "CN"; // getInventoryByPid's sample data is CN-warehouse-only for every product seen so far

  const title = variant.variantKey && variant.variantKey !== baseProduct.productNameEn ? `${baseProduct.productNameEn} - ${variant.variantKey}` : baseProduct.productNameEn;
  // Deduplicated — variant.variantImage frequently equals baseProduct.bigImage
  // (a variant with no distinct photo of its own just inherits the product's
  // main image), and that same image often also appears inside
  // productImageSet, so combining all three sources unfiltered produced a
  // gallery with the same photo 2-3 times (React key warning was the
  // symptom; the real bug was showing a customer a duplicated thumbnail).
  const images = [...new Set([variant.variantImage, baseProduct.bigImage, ...(baseProduct.productImageSet ?? [])].filter((x): x is string => Boolean(x)))].slice(0, 6);
  if (images.length === 0) return false;

  const productId = newId();
  const slug = uniqueSlug(title);
  const sellPrice = priceForCost(costDollars);

  await db.insert(schema.products).values({
    id: productId,
    slug,
    title,
    brandId: GENERIC_BRAND_ID,
    priceCents: toCents(sellPrice),
    originalPriceCents: null,
    currency: "USD",
    images,
    ratingValue: "0",
    ratingCount: 0,
    categoryId: category.id,
    categorySlugPath: [category.topSlug, category.childSlug, category.grandchildSlug],
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
    cjSourceWarehouse: countryCode,
    cjStockStatus: available > 0 ? "in_stock" : "out_of_stock",
  });

  const sku = variant.variantSku ? `CJ-${variant.variantSku}` : `CJ-${newId()}`;
  await db.insert(schema.inventory).values({
    sku,
    productId,
    source: "cj",
    warehouse: `CJ Warehouse (${countryCode})`,
    available,
    reserved: 0,
    incoming: 0,
    status: computeInventoryStatus(available, 0),
  });

  return true;
}

async function loadExistingCjProductIds(): Promise<Set<string>> {
  const rows = await db.select({ cjProductId: schema.productMeta.cjProductId }).from(schema.productMeta);
  return new Set(rows.map((r) => r.cjProductId).filter((id): id is string => Boolean(id)));
}

async function main() {
  console.log(`Starting CJ catalog import — target ${PRODUCTS_PER_LEAF} distinct products per leaf (up to ${MAX_VARIANTS_PER_PRODUCT} variants each)\n`);

  await ensureGenericBrand();
  const existingCjProductIds = await loadExistingCjProductIds();
  console.log(`${existingCjProductIds.size} CJ products already imported — will be skipped\n`);
  const allLeaves = await loadLeafCategories();
  const leavesByTopSlug = new Map<string, LeafCategory[]>();
  for (const leaf of allLeaves) {
    const bucket = leavesByTopSlug.get(leaf.topSlug) ?? [];
    bucket.push(leaf);
    leavesByTopSlug.set(leaf.topSlug, bucket);
  }
  const ultimateFallback = allLeaves[0];

  const topCategories = await cjGet<CjCategoryTop[]>("/product/getCategory");
  const leafCategories: { id: string; name: string; path: string }[] = [];
  for (const top of topCategories) {
    for (const second of top.categoryFirstList ?? []) {
      for (const third of second.categorySecondList ?? []) {
        leafCategories.push({ id: third.categoryId, name: third.categoryName, path: `${top.categoryFirstName} > ${second.categorySecondName} > ${third.categoryName}` });
      }
    }
  }
  const sweepLeaves = leafCategories.slice(0, MAX_LEAVES);
  console.log(`CJ has ${leafCategories.length} leaf categories total; sweeping ${sweepLeaves.length}\n`);

  const checkpoint = loadCheckpoint();
  const doneSet = new Set(checkpoint.doneLeafIds);
  let totalImported = checkpoint.totalImported;

  try {
    for (const leaf of sweepLeaves) {
      if (totalImported >= TOTAL_SAFETY_CAP) break;
      if (doneSet.has(leaf.id)) continue;

      const category = matchCjLeafToOurTree(leaf, leavesByTopSlug, ultimateFallback);
      let productsForLeaf = 0;
      let listingsForLeaf = 0;

      for (let page = 1; page <= MAX_PAGES_PER_LEAF && productsForLeaf < PRODUCTS_PER_LEAF; page++) {
        let listData: CjListResponse;
        try {
          listData = await cjGet<CjListResponse>("/product/listV2", { categoryId: leaf.id, page: String(page), size: "100" });
        } catch (err) {
          if (err instanceof QuotaExceededError) throw err;
          console.error(`  [skip] listV2 failed for ${leaf.name}: ${(err as Error).message}`);
          break;
        }
        const list = listData?.content?.[0]?.productList ?? listData?.list ?? [];
        if (list.length === 0) break;

        for (const item of list) {
          if (productsForLeaf >= PRODUCTS_PER_LEAF || totalImported >= TOTAL_SAFETY_CAP) break;
          if (existingCjProductIds.has(item.id)) continue;

          let detail: CjProductDetail;
          try {
            detail = await cjGet<CjProductDetail>("/product/query", { pid: item.id });
          } catch (err) {
            if (err instanceof QuotaExceededError) throw err;
            console.error(`  [skip] query failed for ${item.id}: ${(err as Error).message}`);
            continue;
          }
          const variants = (detail.variants ?? []).slice(0, MAX_VARIANTS_PER_PRODUCT);
          if (variants.length === 0) continue;

          const stockByVid = new Map<string, number>();
          try {
            const stockData = await cjGet<CjStockResponse>("/product/stock/getInventoryByPid", { pid: item.id });
            for (const entry of stockData.variantInventories ?? []) {
              const total = (entry.inventory ?? []).reduce((sum, inv) => sum + Number(inv.totalInventory ?? 0), 0);
              stockByVid.set(entry.vid, total);
            }
          } catch (err) {
            if (err instanceof QuotaExceededError) throw err;
            console.error(`  [warn] stock lookup failed for ${item.id}, defaulting to 0: ${(err as Error).message}`);
          }

          let importedAnyVariant = false;
          for (const variant of variants) {
            try {
              const ok = await importVariant(detail, variant, stockByVid, category);
              if (ok) {
                importedAnyVariant = true;
                listingsForLeaf++;
                totalImported++;
              }
            } catch (err) {
              console.error(`  [skip] insert failed for variant ${variant.vid}: ${(err as Error).message}`);
            }
          }
          existingCjProductIds.add(item.id);
          if (importedAnyVariant) productsForLeaf++;
        }
      }

      doneSet.add(leaf.id);
      saveCheckpoint({ doneLeafIds: [...doneSet], totalImported });
      console.log(`[+${listingsForLeaf} listings / ${productsForLeaf} products, total ${totalImported}] ${leaf.path} -> ${category.name}`);
    }
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      console.log(`\nStopped: CJ reports quota exceeded (${err.message}). Progress is checkpointed —`);
      console.log(`re-run this script (e.g. tomorrow, once the quota resets) to continue from here.`);
      process.exit(0);
    }
    throw err;
  }

  console.log(`\nDone. Imported ${totalImported} real CJ listings this run.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
