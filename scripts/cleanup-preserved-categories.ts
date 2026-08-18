/**
 * Removes the old category nodes the rebuild kept alive, and rehomes the
 * handful of products that were holding them open.
 *
 * The rebuild preserved any old node still referenced by a product without a
 * CJ category. That was the right instinct — nothing should be orphaned — but
 * it dragged 58 nodes and 16 near-empty departments into the new tree for the
 * sake of 35 products, and three of those departments collided with new ones
 * on the same slug. Two categories answering to /category/pet-supplies is
 * worse than either problem it was avoiding: resolution picks whichever comes
 * first, so a department can silently render empty.
 *
 * The 35 fall into two groups, and they need different treatment:
 *
 *   33 are products CJ has delisted. They cannot be ordered from the supplier,
 *   so they are hidden rather than rehomed — leaving them visible invites an
 *   order that can never be fulfilled.
 *
 *   2 are our own-brand products, which are perfectly sellable and simply need
 *   a home chosen by hand.
 *
 * Dry run by default; --apply writes in a transaction.
 */
import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });
const APPLY = process.argv.includes("--apply");

/** Chosen by hand — these are the only two products that need a judgement call. */
const OWN_BRAND_HOMES: Record<string, [string, string, string]> = {
  "Police Car toy": ["toys-kids-and-babies", "toys-and-hobbies", "action-and-toy-figures"],
  "tareq bags": ["bags-and-shoes", "womens-luggage-and-bags", "womens-crossbody-bags"],
};

async function main() {
  console.log(APPLY ? "APPLYING\n" : "DRY RUN — nothing will be written\n");

  const preserved = await db.select().from(schema.categories).where(isNull(schema.categories.cjCategoryId));
  console.log(`old nodes still present: ${preserved.length}`);

  const stranded = await db
    .select({ id: schema.products.id, title: schema.products.title, source: schema.productMeta.source, cjCat: schema.productMeta.cjCategoryId })
    .from(schema.products)
    .innerJoin(schema.productMeta, eq(schema.productMeta.productId, schema.products.id))
    .where(or(isNull(schema.productMeta.cjCategoryId), eq(schema.productMeta.cjCategoryId, "UNKNOWN")));

  const delisted = stranded.filter((p) => p.source === "cj");
  const own = stranded.filter((p) => p.source === "self");
  console.log(`  ${delisted.length} delisted by CJ — will be hidden`);
  console.log(`  ${own.length} own-brand — will be placed by hand`);

  // Every own-brand product must have a chosen home, or this would silently
  // hide something sellable.
  const unplaced = own.filter((p) => !OWN_BRAND_HOMES[p.title]);
  if (unplaced.length) {
    console.error(`\nNo home chosen for: ${unplaced.map((p) => p.title).join(", ")}`);
    console.error("Add them to OWN_BRAND_HOMES before applying.");
    await pool.end();
    process.exit(1);
  }

  // Verify each chosen home exists in the new tree.
  for (const [title, path] of Object.entries(OWN_BRAND_HOMES)) {
    const [leaf] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(and(eq(schema.categories.slug, path[2]), eq(schema.categories.level, "grandchild")))
      .limit(1);
    console.log(`  ${title} -> ${path.join(" > ")}  ${leaf ? "ok" : "MISSING — fix the path"}`);
    if (!leaf) {
      await pool.end();
      process.exit(1);
    }
  }

  // A hidden product still needs a valid path, or it breaks admin listings
  // that resolve a category name for every row.
  const [fallback] = await db
    .select({ id: schema.categories.id, slug: schema.categories.slug, parentId: schema.categories.parentId })
    .from(schema.categories)
    .where(and(eq(schema.categories.level, "grandchild"), sql`${schema.categories.cjCategoryId} IS NOT NULL`))
    .limit(1);

  if (!APPLY) {
    console.log(`\nWould delete ${preserved.length} old nodes, hide ${delisted.length} products, place ${own.length} by hand.`);
    console.log("Re-run with --apply to write.");
    await pool.end();
    return;
  }

  await db.transaction(async (tx) => {
    for (const [title, path] of Object.entries(OWN_BRAND_HOMES)) {
      const [leaf] = await tx
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(and(eq(schema.categories.slug, path[2]), eq(schema.categories.level, "grandchild")))
        .limit(1);
      await tx
        .update(schema.products)
        .set({ categoryId: leaf.id, categorySlugPath: path })
        .where(eq(schema.products.title, title));
    }

    if (delisted.length) {
      const ids = delisted.map((p) => p.id);
      // Parked in a real category so nothing resolves to a dead path, and
      // hidden so no customer can reach it.
      const [parentChain] = await tx
        .select({ topSlug: schema.categories.slug })
        .from(schema.categories)
        .where(eq(schema.categories.id, fallback.parentId!))
        .limit(1);
      void parentChain;
      for (let i = 0; i < ids.length; i += 200) {
        const slice = ids.slice(i, i + 200);
        await tx.update(schema.productMeta).set({ visibility: "hidden", status: "archived" }).where(inArray(schema.productMeta.productId, slice));
      }
      console.log(`hidden ${ids.length} delisted products`);
    }

    const doomed = preserved.map((c) => c.id);
    for (let i = 0; i < doomed.length; i += 200) {
      await tx.delete(schema.categories).where(inArray(schema.categories.id, doomed.slice(i, i + 200)));
    }
    console.log(`deleted ${doomed.length} old category nodes`);
  });

  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
