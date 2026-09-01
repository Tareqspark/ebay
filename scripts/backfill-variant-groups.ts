/**
 * Ties variant rows together so the shop stops listing one product five times.
 *
 * A supplier product that comes in several colours or sizes was imported as one
 * row per combination, and nothing recorded that they belonged together: Pet
 * Sweaters showed 181 cards for 87 real products, and a search for "pet
 * sweater" returned twelve products as twenty-four results.
 *
 * The rows themselves are right — price, stock, images and fulfilment are all
 * genuinely per-combination, and cart_items, order_items and inventory each key
 * on a product id. Only the grouping was missing.
 *
 * Two things are written here:
 *
 *   variantGroupId — cj_product_id for supplier stock, the row's own id for
 *   everything else, so every product belongs to a group even if it is a group
 *   of one and listing code never needs a special case.
 *
 *   variantLabel — what a selector shows. A label the supplier already gave us
 *   is kept as it is; only a row without one has it derived, from whatever
 *   follows the longest title prefix its group shares. Deriving is a fallback,
 *   not the rule: the import now records CJ's own variantKey directly.
 *
 * Titles and slugs are both left alone. Slugs are live URLs, and rewriting
 * titles is a separate job with its own risks — 77,700 rows whose correct new
 * name can only come from CJ, and groups of one with no sibling to compare
 * against. Past orders keep their own title copy regardless.
 *
 * Dry run by default; --apply writes.
 */
import { eq, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });
const APPLY = process.argv.includes("--apply");

/** Longest prefix shared by every title in the group, cut back to a word boundary. */
function sharedPrefix(titles: string[]): string {
  if (titles.length === 1) return titles[0];
  let end = 0;
  outer: for (; end < titles[0].length; end++) {
    const ch = titles[0][end];
    for (const t of titles) if (t[end] !== ch) break outer;
  }
  let prefix = titles[0].slice(0, end);
  // Don't cut mid-word: "Red-S"/"Red-M" share "Red-" and would otherwise leave
  // a base title ending in a dangling fragment.
  const cut = Math.max(prefix.lastIndexOf(" "), prefix.lastIndexOf("-"));
  if (cut > 0) prefix = prefix.slice(0, cut);
  return prefix.replace(/[\s\-–—,:;]+$/, "").trim();
}

async function main() {
  console.log(APPLY ? "APPLYING\n" : "DRY RUN — nothing will be written\n");

  const rows = await db
    .select({
      id: schema.products.id,
      title: schema.products.title,
      storedLabel: schema.products.variantLabel,
      cjProductId: schema.productMeta.cjProductId,
      source: schema.productMeta.source,
    })
    .from(schema.products)
    .leftJoin(schema.productMeta, eq(schema.productMeta.productId, schema.products.id));

  // Supplier stock groups on the supplier's product id; anything else is its
  // own group, so downstream code can always group by the one column.
  const groups = new Map<string, { id: string; title: string; storedLabel: string | null }[]>();
  for (const r of rows) {
    const key = r.source === "cj" && r.cjProductId ? r.cjProductId : r.id;
    const list = groups.get(key) ?? [];
    list.push({ id: r.id, title: r.title, storedLabel: r.storedLabel });
    groups.set(key, list);
  }

  const updates: { id: string; groupId: string; label: string | null; title: string }[] = [];
  let multi = 0;
  let unlabelled = 0;

  for (const [groupId, members] of groups) {
    if (members.length > 1) multi++;
    const base = sharedPrefix(members.map((m) => m.title));

    for (const m of members) {
      /**
       * A label the supplier gave us always wins.
       *
       * This script originally derived every label from the title, because at
       * the time the title was the only place a variant was recorded. The
       * import now writes CJ's own variantKey to variant_label and leaves the
       * title alone, so within a group the titles are identical — and deriving
       * from them would produce an empty string for every row and replace
       * 121,033 real labels ("Pink-XL", "Emerald Green-S") with "Option 1",
       * "Option 2". Re-running this as written would have destroyed them.
       */
      let label: string | null = m.storedLabel;

      if (!label && members.length > 1) {
        label = m.title.slice(base.length).replace(/^[\s\-–—,:]+/, "").trim() || null;
        // Siblings whose titles are identical give nothing to choose between.
        // A positional label is honest about that and still lets the selector
        // work.
        if (!label) {
          unlabelled++;
          label = `Option ${members.indexOf(m) + 1}`;
        }
      }

      /**
       * Titles are left exactly as they are.
       *
       * Rewriting them is a separate, riskier job: 77,700 rows across 7,777
       * groups, where the only correct new title comes from CJ rather than
       * from anything derivable locally, and where a group of one has no
       * sibling to compare against. It needs its own backup, dry run and
       * rollback file — not a side effect of fixing labels.
       */
      updates.push({ id: m.id, groupId, label, title: m.title });
    }
  }

  console.log(`${rows.length} products in ${groups.size} groups`);
  console.log(`  groups with more than one variant: ${multi}`);
  console.log(`  variants with no distinguishing text: ${unlabelled}`);
  const kept = updates.filter((u) => u.label !== null).length;
  console.log(`  labels preserved from the supplier or derived: ${kept}`);

  const sample = [...groups.values()].filter((g) => g.length > 2)[0];
  if (sample) {
    const base = sharedPrefix(sample.map((m) => m.title));
    console.log(`\nexample group of ${sample.length}:`);
    console.log(`  title      : ${sample[0].title}`);
    for (const m of sample.slice(0, 5)) {
      const derived = m.title.slice(base.length).replace(/^[\s\-–—,:]+/, "").trim();
      console.log(`  label      : ${m.storedLabel ?? derived ?? "(none)"}${m.storedLabel ? "  (from supplier)" : "  (derived)"}`);
    }
  }

  if (!APPLY) {
    console.log(`\nWould update ${updates.length} rows. Re-run with --apply to write.`);
    await pool.end();
    return;
  }

  let done = 0;
  for (const u of updates) {
    await db
      .update(schema.products)
      .set({ variantGroupId: u.groupId, variantLabel: u.label, title: u.title })
      .where(eq(schema.products.id, u.id));
    done++;
    if (done % 5000 === 0) console.log(`  ${done}/${updates.length}`);
  }

  const [check] = await db
    .select({ n: schema.products.id })
    .from(schema.products)
    .where(isNotNull(schema.products.variantGroupId))
    .limit(1);
  console.log(`\nwrote ${done} rows; grouping present: ${check ? "yes" : "NO"}`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
