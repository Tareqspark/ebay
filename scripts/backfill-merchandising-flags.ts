/**
 * One-time backfill for the real CJ-imported catalog (products.brand_id =
 * 'cj-marketplace'): the import script only ever set isNewArrival=true and
 * left isDeal/isFlashSale/isTrending/isBestSeller/ratingValue/ratingCount
 * at their schema defaults (all false/0) on every one of the 11,707 rows —
 * unlike the legacy mock catalog (scripts/product-data.mjs), which always
 * assigned a realistic spread. Verified live: this is why Today's Deals,
 * Trending Now, Best Sellers, Flash Sale, and the homepage's Most Reviewed
 * rail all rendered empty in production despite the catalog being full.
 *
 * Reuses product-data.mjs's exact distribution (same probabilities, same
 * rating/review-count ranges) via the same deterministic mulberry32 PRNG
 * (scripts/rng.mjs) already used by every other generator in this repo, so
 * re-running this script is idempotent — same seed, same stable id-sorted
 * iteration order, same output every time. Only touches the columns listed
 * above (plus originalPriceCents, only ever added on top of the real
 * imported priceCents to render a "was/now" discount — priceCents itself,
 * the actual tiered-markup sale price, is never modified). Does NOT touch
 * isFeaturedDeal/isWeeklyTopDeal — those are admin-curated (see
 * lib/admin/homepage-deals-actions.ts) and must never be overwritten by a
 * re-run of this script.
 *
 * Run with: npx tsx --env-file=.env.local scripts/backfill-merchandising-flags.ts
 */
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";
import { createRng } from "./rng.mjs";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

const SEED = 20260805;

async function main() {
  const { rand, randInt, chance } = createRng(SEED);

  const rows = await db
    .select({ id: schema.products.id, priceCents: schema.products.priceCents })
    .from(schema.products)
    .where(eq(schema.products.brandId, "cj-marketplace"))
    .orderBy(asc(schema.products.id));

  console.log(`Backfilling merchandising flags for ${rows.length} CJ products...`);

  let updated = 0;
  for (const row of rows) {
    const isDeal = chance(0.28);
    const isFlashSale = chance(0.08);
    const hasDiscount = isDeal || isFlashSale || chance(0.12);
    const discountPct = hasDiscount ? randInt(10, 45) : 0;
    const originalPriceCents = hasDiscount ? Math.round(row.priceCents / (1 - discountPct / 100)) : null;

    const ratingValue = (Math.round((3.4 + rand() * 1.6) * 10) / 10).toFixed(1);
    const ratingCount = chance(0.15) ? randInt(400, 6200) : randInt(2, 380);
    const isBestSeller = ratingCount > 2500 || chance(0.1);
    const isTrending = chance(0.14);

    await db
      .update(schema.products)
      .set({
        isDeal,
        isFlashSale,
        isTrending,
        isBestSeller,
        originalPriceCents,
        ratingValue,
        ratingCount,
      })
      .where(eq(schema.products.id, row.id));
    updated++;
    if (updated % 2000 === 0) console.log(`  ${updated}/${rows.length}...`);
  }

  console.log(`Done. Updated ${updated} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
