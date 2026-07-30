/**
 * One-time cleanup: scripts/import-cj-products.ts combined variantImage +
 * bigImage + productImageSet without deduplicating, and the same photo
 * frequently appears in more than one of those sources — 9,673 of 11,707
 * imported products had a duplicated thumbnail in their gallery (and
 * components/product/product-gallery.tsx keys each thumbnail by its own
 * URL, so a duplicate also threw a real React "two children with the same
 * key" error, which is how this was found). Pure DB fix, no CJ API calls.
 *
 * Run with: npx tsx scripts/dedupe-product-images.ts
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

async function main() {
  const products = await db.select({ id: schema.products.id, images: schema.products.images }).from(schema.products);

  let fixed = 0;
  for (const product of products) {
    const deduped = [...new Set(product.images)];
    if (deduped.length === product.images.length) continue;
    await db.update(schema.products).set({ images: deduped }).where(eq(schema.products.id, product.id));
    fixed++;
  }

  console.log(`Deduplicated images for ${fixed} of ${products.length} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
