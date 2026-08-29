/**
 * Fetches the colours and sizes we never imported.
 *
 * The original import capped at two variants per product, which turned out to
 * truncate roughly two thirds of the catalogue: a sample of twelve products
 * held 22 variants between them where CJ offers 84, one of them 22 on its own.
 * So a shopper sees a coat in two sizes when the supplier stocks fifteen.
 *
 * This walks the products already imported and adds the variants missing from
 * each. It buys no new products — the sweep in import-cj-products.ts does that
 * — and deliberately cannot, because breadth and depth compete for the same
 * daily points and doing both at once makes neither predictable.
 *
 * Cost is two calls per product, 20 points: the detail, which carries every
 * variant, and its stock, which carries every variant's inventory. Both are
 * per-product rather than per-variant, which is what makes depth cheaper per
 * listing than breadth even at twice the calls.
 *
 * Paced deliberately slower than the sweep. CJ froze this account's API after
 * two days of sustained importing, and the freeze is not worth a few hours.
 *
 * Resumable: products already processed are recorded, so a quota stop, a
 * dropped connection or a deliberate interrupt all just mean running it again.
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
const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
/** 1.5s rather than the 1.1s minimum — see the note about the freeze above. */
const MIN_CALL_GAP_MS = Number(process.env.CJ_GAP_MS ?? 1500);
const MAX_VARIANTS_PER_PRODUCT = Number(process.env.CJ_MAX_VARIANTS ?? 24);
const LIMIT = Number(process.env.CJ_BACKFILL_LIMIT ?? Infinity);
const CHECKPOINT = new URL("./.cj-variant-backfill.json", import.meta.url);

class QuotaExceededError extends Error {}

interface CjVariant {
  vid: string;
  variantKey?: string;
  variantSku?: string;
  variantImage?: string;
  variantSellPrice?: number | string;
}
interface CjInventory {
  variantInventories?: { vid: string; inventory?: { totalInventory?: number | string }[] }[];
}
interface CjDetail {
  pid: string;
  productNameEn?: string;
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

async function cjGet<T>(path: string, pid: string): Promise<T | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const wait = Math.max(0, lastCallAt + MIN_CALL_GAP_MS - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();

    const res = await fetch(`${CJ_BASE}${path}?pid=${pid}`, {
      headers: { "CJ-Access-Token": await getToken() },
    });
    const body = await res.json();
    if (body.pointsInfo) points = { used: body.pointsInfo.usedToday, total: body.pointsInfo.total };
    // Both spellings: /product/query answers with result, but
    // getInventoryByPid answers with success and leaves result undefined —
    // checking only result silently returned null and wrote every variant in
    // at zero stock.
    if (body.result ?? body.success) return body.data as T;

    const message: string = body.message ?? "";
    // Being rate limited is transient; a spent budget and a disabled account
    // are both terminal, and 1600014 is the freeze we have already hit once.
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
    return null; // delisted, or a product CJ will not answer for
  }
  return null;
}

function priceForCost(costDollars: number): number {
  const multiplier = costDollars <= 10 ? 3.75 : costDollars <= 30 ? 2.75 : costDollars <= 100 ? 2.1 : 1.7;
  return Math.floor(costDollars * multiplier) + 0.99;
}
const toCents = (d: number) => Math.round(d * 100);

const SLUG_MAX = 191;
const SLUG_BASE_MAX = SLUG_MAX - 5;
const usedSlugs = new Set<string>();
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function uniqueSlug(title: string): string {
  const raw = slugify(title) || ulid().toLowerCase();
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

interface Checkpoint { done: string[]; added: number }
function loadCheckpoint(): Checkpoint {
  try { return JSON.parse(fs.readFileSync(CHECKPOINT, "utf8")); } catch { return { done: [], added: 0 }; }
}
function saveCheckpoint(cp: Checkpoint): void {
  fs.writeFileSync(CHECKPOINT, JSON.stringify(cp, null, 2));
}

async function main() {
  console.log(APPLY ? "APPLYING\n" : "DRY RUN — no rows will be written\n");

  // One row per product we already own, with a sibling to copy the category,
  // brand and rating from. Those are properties of the product, not of the
  // colour, so a new variant inherits them rather than being re-derived.
  const owned = await db
    .select({
      pid: schema.productMeta.cjProductId,
      productId: schema.products.id,
      title: schema.products.title,
      categoryId: schema.products.categoryId,
      categorySlugPath: schema.products.categorySlugPath,
      brandId: schema.products.brandId,
      ratingValue: schema.products.ratingValue,
      ratingCount: schema.products.ratingCount,
      description: schema.products.description,
      variantGroupId: schema.products.variantGroupId,
      cjCategoryId: schema.productMeta.cjCategoryId,
      cjCategoryPath: schema.productMeta.cjCategoryPath,
    })
    .from(schema.products)
    .innerJoin(schema.productMeta, eq(schema.productMeta.productId, schema.products.id))
    .where(and(eq(schema.productMeta.source, "cj"), isNotNull(schema.productMeta.cjProductId)));

  const byPid = new Map<string, (typeof owned)[number]>();
  const haveVids = new Map<string, Set<string>>();
  for (const row of owned) if (row.pid && !byPid.has(row.pid)) byPid.set(row.pid, row);

  const vidRows = await db
    .select({ pid: schema.productMeta.cjProductId, vid: schema.productMeta.cjVariantId })
    .from(schema.productMeta)
    .where(and(eq(schema.productMeta.source, "cj"), isNotNull(schema.productMeta.cjProductId)));
  for (const r of vidRows) {
    if (!r.pid) continue;
    const set = haveVids.get(r.pid) ?? new Set<string>();
    if (r.vid) set.add(r.vid);
    haveVids.set(r.pid, set);
  }

  for (const r of await db.select({ slug: schema.products.slug }).from(schema.products)) usedSlugs.add(r.slug);
  console.log(`${byPid.size} products own the catalogue; ${usedSlugs.size} slugs already taken`);

  const cp = loadCheckpoint();
  const done = new Set(cp.done);
  const todo = [...byPid.keys()].filter((pid) => !done.has(pid)).slice(0, LIMIT);
  console.log(`${done.size} already processed, ${todo.length} to go`);
  // Two calls per product: the detail and its stock.
  console.log(`estimated ${(todo.length * 20).toLocaleString()} points, about ${((todo.length * 2 * MIN_CALL_GAP_MS) / 3_600_000).toFixed(1)} hours of calls\n`);

  if (!APPLY) {
    console.log("Re-run with --apply to write.");
    await pool.end();
    return;
  }

  let added = cp.added;
  let productsTouched = 0;
  let skipped = 0;

  try {
    for (const pid of todo) {
      const base = byPid.get(pid)!;
      const detail = await cjGet<CjDetail>("/product/query", pid);
      if (!detail) { skipped++; done.add(pid); continue; }

      /**
       * Stock is a second call, and it doubles the cost of this backfill.
       *
       * It is not optional: a variant inserted with zero stock renders as "Out
       * of Stock" and cannot be added to a basket, so skipping this would add
       * a hundred thousand listings nobody can buy. One call covers every
       * variant of the product, which is what keeps it to 10 points.
       */
      const stockByVid = new Map<string, number>();
      const inv = await cjGet<CjInventory>("/product/stock/getInventoryByPid", pid);
      for (const entry of inv?.variantInventories ?? []) {
        stockByVid.set(entry.vid, (entry.inventory ?? []).reduce((sum, i) => sum + Number(i.totalInventory ?? 0), 0));
      }

      const have = haveVids.get(pid) ?? new Set<string>();
      const missing = (detail.variants ?? [])
        .filter((v) => v.vid && !have.has(v.vid))
        .slice(0, Math.max(0, MAX_VARIANTS_PER_PRODUCT - have.size));

      for (const v of missing) {
        const costDollars = Number(v.variantSellPrice ?? 0);
        if (!costDollars || costDollars <= 0) continue;
        const images = [...new Set([v.variantImage, detail.bigImage, ...(detail.productImageSet ?? [])].filter(Boolean))].slice(0, 6) as string[];
        if (images.length === 0) continue;

        const sellPrice = priceForCost(costDollars);
        const productId = ulid();
        try {
          await db.insert(schema.products).values({
            id: productId,
            slug: uniqueSlug(base.title),
            title: base.title,
            variantGroupId: base.variantGroupId ?? pid,
            variantLabel: v.variantKey && v.variantKey !== detail.productNameEn ? v.variantKey : null,
            brandId: base.brandId,
            priceCents: toCents(sellPrice),
            originalPriceCents: null,
            currency: "USD",
            images,
            ratingValue: base.ratingValue,
            ratingCount: base.ratingCount,
            categoryId: base.categoryId,
            categorySlugPath: base.categorySlugPath,
            isNewArrival: true,
            freeShipping: sellPrice >= 50,
            stock: Math.max(0, Math.floor(stockByVid.get(v.vid) ?? 0)),
            description: base.description,
            features: [],
          });
          await db.insert(schema.productMeta).values({
            productId,
            source: "cj",
            costCents: toCents(costDollars),
            status: "active",
            visibility: "visible",
            cjProductId: pid,
            cjVariantId: v.vid,
            cjCategoryId: base.cjCategoryId,
            cjCategoryPath: base.cjCategoryPath,
            cjSourceWarehouse: "CN",
            cjStockStatus: (stockByVid.get(v.vid) ?? 0) > 0 ? "in_stock" : "out_of_stock",
          });
          await db.insert(schema.inventory).values({
            sku: v.variantSku ? `CJ-${v.variantSku}` : `CJ-${ulid()}`,
            productId,
            source: "cj",
            warehouse: "CJ Warehouse (CN)",
            available: Math.max(0, Math.floor(stockByVid.get(v.vid) ?? 0)),
            reserved: 0,
            incoming: 0,
            status: (stockByVid.get(v.vid) ?? 0) > 0 ? "in_stock" : "out_of_stock",
          });
          added++;
          have.add(v.vid);
        } catch (err) {
          console.error(`  [skip] ${pid} variant ${v.vid}: ${(err as Error).message.slice(0, 90)}`);
        }
      }

      done.add(pid);
      productsTouched++;
      if (productsTouched % 50 === 0) {
        saveCheckpoint({ done: [...done], added });
        console.log(`  ${productsTouched}/${todo.length} products · +${added} variants · points ${points.used}/${points.total}`);
      }
    }
  } catch (err) {
    saveCheckpoint({ done: [...done], added });
    if (err instanceof QuotaExceededError) {
      console.log(`\nStopped: ${err.message}`);
      console.log("Progress is checkpointed — re-run to continue.");
      await pool.end();
      process.exit(0);
    }
    throw err;
  }

  saveCheckpoint({ done: [...done], added });
  console.log(`\nadded ${added} variants across ${productsTouched} products (${skipped} unavailable)`);
  console.log(`points used: ${points.used}/${points.total}`);
  console.log("\nRe-run scripts/backfill-variant-groups.ts afterwards — base titles and");
  console.log("labels are derived from what a group contains, and it has just changed.");
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
