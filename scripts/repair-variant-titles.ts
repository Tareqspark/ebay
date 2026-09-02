/**
 * Removes the variant suffix left stranded in product titles.
 *
 * The original importer glued the variant onto the title — "Woolen Coat - Red-S"
 * — and the variant backfill then copied that whole string onto every sibling it
 * added. So a coat in twelve colours shows the same title twelve times, each
 * ending in "Red-S", and the admin list reads as twelve identical rows.
 *
 * The same suffix is also the one piece of variant identity we never captured.
 * Every group has exactly one row with no label: the row the first import
 * created, whose variant went into the title instead of into variant_label.
 * The suffix is that row's label.
 *
 *   title  "Cinched Waist Slim-fit Women's Woolen Coat - Red-S"
 *   labels [null, "Red-M", "Red-L", "Red-XL", "Black-S", ...]
 *
 * So one pass fixes both: the suffix becomes the missing label, and the prefix
 * becomes the group's true title. No supplier call is needed — the information
 * was in the database all along, in the wrong column.
 *
 * Deliberately conservative. A title is only cut when the suffix demonstrably
 * belongs to the same family as its siblings' labels, because plenty of product
 * names end in a dash for reasons of their own ("Molar stick for chinchilla and
 * rabbit - Grass ball"). Groups of one are never touched: there is no sibling to
 * corroborate against, so any cut would be a guess.
 *
 * Writes a rollback file of every previous title before changing anything.
 *
 * Dry run by default; --apply writes.
 */
import fs from "node:fs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });
const APPLY = process.argv.includes("--apply");
const ROLLBACK = new URL("./.variant-title-rollback.json", import.meta.url);

/** Words a label is made of, lowercased — "Golden brown-M" -> [golden, brown, m]. */
function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[\s\-–—_/,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Whether a title's trailing fragment is really this group's variant.
 *
 * The test is family resemblance: the suffix has to share a word with at least
 * one sibling label. "Red-S" against siblings "Red-M"/"Red-L" shares "red" and
 * passes; "Grass ball" against a group that has no siblings at all never gets
 * this far. A bare size is admitted too — a group labelled "S"/"M"/"L" has no
 * word in common with "XL" but is plainly the same axis.
 */
const SIZE = /^(xxs|xs|s|m|l|xl|xxl|2xl|3xl|4xl|5xl|6xl|one size|free size)$/;
function suffixBelongs(suffix: string, siblingLabels: string[]): boolean {
  const suf = tokens(suffix);
  if (suf.length === 0) return false;
  const sibTokens = new Set(siblingLabels.flatMap(tokens));
  if (suf.some((t) => sibTokens.has(t))) return true;
  // Same axis, different value: "XL" among "S"/"M"/"L".
  const sufIsSize = suf.every((t) => SIZE.test(t));
  const sibsAreSizes = siblingLabels.length > 0 && siblingLabels.every((l) => tokens(l).every((t) => SIZE.test(t)));
  return sufIsSize && sibsAreSizes;
}

async function main() {
  console.log(APPLY ? "APPLYING\n" : "DRY RUN — nothing will be written\n");

  const rows = await db
    .select({
      id: schema.products.id,
      title: schema.products.title,
      label: schema.products.variantLabel,
      groupId: schema.products.variantGroupId,
    })
    .from(schema.products);

  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    if (!r.groupId) continue;
    const list = groups.get(r.groupId) ?? [];
    list.push(r);
    groups.set(r.groupId, list);
  }

  const titleUpdates: { id: string; from: string; to: string }[] = [];
  const labelUpdates: { id: string; label: string }[] = [];
  const samples: string[] = [];
  let skippedNoSuffix = 0;
  let skippedUnrelated = 0;
  let skippedSingle = 0;

  for (const members of groups.values()) {
    // A group of one has nothing to corroborate a cut against.
    if (members.length < 2) {
      skippedSingle++;
      continue;
    }

    // Every sibling carries the same stale title; take it from any of them.
    const title = members[0].title;
    const cut = title.lastIndexOf(" - ");
    if (cut <= 0) {
      skippedNoSuffix++;
      continue;
    }

    const base = title.slice(0, cut).trim();
    const suffix = title.slice(cut + 3).trim();
    if (!base || !suffix) {
      skippedNoSuffix++;
      continue;
    }

    const siblingLabels = members.map((m) => m.label).filter((l): l is string => Boolean(l));
    if (!suffixBelongs(suffix, siblingLabels)) {
      skippedUnrelated++;
      continue;
    }

    for (const m of members) {
      if (m.title !== base) titleUpdates.push({ id: m.id, from: m.title, to: base });
      // The unlabelled row is the one whose variant went into the title.
      if (!m.label) labelUpdates.push({ id: m.id, label: suffix });
    }

    if (samples.length < 5) {
      samples.push(`  ${JSON.stringify(title)}\n    -> title ${JSON.stringify(base)}, missing label ${JSON.stringify(suffix)}`);
    }
  }

  console.log(`${groups.size.toLocaleString()} groups examined`);
  console.log(`  titles to shorten      : ${titleUpdates.length.toLocaleString()}`);
  console.log(`  labels to recover      : ${labelUpdates.length.toLocaleString()}`);
  console.log(`  skipped, group of one  : ${skippedSingle.toLocaleString()}`);
  console.log(`  skipped, no " - "      : ${skippedNoSuffix.toLocaleString()}`);
  console.log(`  skipped, suffix unrelated to siblings: ${skippedUnrelated.toLocaleString()}`);
  console.log(`\nsamples:\n${samples.join("\n")}`);

  if (!APPLY) {
    console.log(`\nRe-run with --apply to write.`);
    await pool.end();
    return;
  }

  // Written before the first update, so a bad run is always reversible without
  // restoring the whole database.
  fs.writeFileSync(ROLLBACK, JSON.stringify(titleUpdates, null, 2));
  console.log(`\nrollback written: ${ROLLBACK.pathname} (${titleUpdates.length} previous titles)`);

  let n = 0;
  for (const u of titleUpdates) {
    // Never write an empty title, whatever the parsing produced.
    if (!u.to.trim()) continue;
    await db.update(schema.products).set({ title: u.to }).where(eq(schema.products.id, u.id));
    if (++n % 10000 === 0) console.log(`  titles ${n}/${titleUpdates.length}`);
  }
  let l = 0;
  for (const u of labelUpdates) {
    await db.update(schema.products).set({ variantLabel: u.label }).where(eq(schema.products.id, u.id));
    l++;
  }
  console.log(`\nshortened ${n.toLocaleString()} titles, recovered ${l.toLocaleString()} labels`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
