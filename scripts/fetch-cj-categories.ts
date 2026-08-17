/**
 * Records each product's own CJ category, so filing stops being a guess.
 *
 * The original importer never stored the supplier's category, so products
 * were sorted by matching words between their title and ours. An audit of all
 * 11,807 found 66% mis-filed — "Non-slip Doormat" under Women's Slips,
 * "Solid-color dress" under Solid-State Drives. CJ knows the answer for every
 * product it sells; this asks it once and writes it down.
 *
 * Cost, measured rather than assumed: /product/query is 10 API points per
 * product and there is no batch form — /product/query?pid=a,b,c returns
 * "Product not found", and /product/list?pid= works but costs 50. Variants
 * share a pid, so 11,807 listings are only ~5,192 lookups. Against a 50,000
 * daily budget that is a single day, and roughly half what the original
 * import spent fetching detail and stock for the same products.
 *
 * Reads from CJ and writes two columns. It changes nothing a customer sees —
 * the tree rebuild that uses this data is a separate, later step.
 *
 * Resumable: only products with no category recorded are fetched, so it can
 * be stopped, or run out of points, and simply re-run.
 */
import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const MIN_CALL_GAP_MS = 1100; // CJ enforces 1 request/second.
const LIMIT = Number(process.env.CJ_CATEGORY_LIMIT ?? Infinity);

class QuotaExceededError extends Error {}

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

async function cjGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const url = `${CJ_BASE}${path}?${new URLSearchParams(params)}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const wait = Math.max(0, lastCallAt + MIN_CALL_GAP_MS - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();

    const res = await fetch(url, { headers: { "CJ-Access-Token": await getToken() } });
    const body = await res.json();
    if (body.pointsInfo) points = { used: body.pointsInfo.usedToday, total: body.pointsInfo.total };

    if (body.result ?? body.success) return body.data as T;
    // Running out of daily points is terminal; being rate limited is not.
    if (body.code === 16900500 || /insufficient.*points|quota/i.test(body.message ?? "")) {
      throw new QuotaExceededError(body.message);
    }
    if (res.status === 429 || /too many requests|qps limit/i.test(body.message ?? "") || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      continue;
    }
    // A product CJ no longer lists returns "Product not found". That is an
    // answer, not a failure — skip it rather than retrying or aborting.
    return null;
  }
  return null;
}

interface CjDetail {
  categoryId?: string;
  categoryName?: string;
}

async function main() {
  // One row per distinct CJ product; variants of the same product share both
  // the pid and the category, so they are updated together below.
  const pending = await db
    .selectDistinct({ pid: schema.productMeta.cjProductId })
    .from(schema.productMeta)
    .where(and(isNotNull(schema.productMeta.cjProductId), isNull(schema.productMeta.cjCategoryId)));

  const todo = pending.map((r) => r.pid!).filter(Boolean).slice(0, LIMIT);
  console.log(`${todo.length} products still need a category`);
  if (todo.length === 0) return;
  console.log(`estimated ${(todo.length * 10).toLocaleString()} API points, about ${(todo.length / 3200).toFixed(1)} hours\n`);

  let done = 0, missing = 0, listings = 0;
  try {
    for (const pid of todo) {
      const detail = await cjGet<CjDetail>("/product/query", { pid });
      if (!detail?.categoryId) {
        missing++;
        // Marked so a re-run doesn't keep paying to ask the same question.
        await db.update(schema.productMeta).set({ cjCategoryId: "UNKNOWN" }).where(eq(schema.productMeta.cjProductId, pid));
        continue;
      }
      const result = await db
        .update(schema.productMeta)
        .set({ cjCategoryId: detail.categoryId, cjCategoryPath: (detail.categoryName ?? "").slice(0, 255) })
        .where(eq(schema.productMeta.cjProductId, pid));
      listings += (result as unknown as { affectedRows?: number }).affectedRows ?? 0;
      done++;
      if (done % 100 === 0) {
        console.log(`  ${done}/${todo.length} products · ${listings} listings · points ${points.used}/${points.total}`);
      }
    }
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      console.error(`\nStopped: CJ daily points exhausted at ${done}/${todo.length}. Re-run tomorrow — progress is saved.`);
    } else {
      throw err;
    }
  }

  console.log(`\nrecorded ${done} products (${listings} listings), ${missing} no longer listed by CJ`);
  console.log(`points used: ${points.used}/${points.total}`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
