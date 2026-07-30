/**
 * Comprehensive category re-derivation for every CJ-imported product, from
 * its own TITLE rather than CJ's category names — the original import
 * matched CJ's (often generic, sometimes non-overlapping-with-ours)
 * category names, which produced several dumping-ground mismatches
 * (verified by sampling: a "Car Ghost Claw Sticker" filed under "Beading
 * Thread", lingerie filed under "Office Storage"). A product's own title is
 * a much richer, more specific signal.
 *
 * Word overlap, not Fuse (see lib/admin/permissions.ts's RBAC matching for
 * the same lesson) — Fuse's fuzzy edit-distance search is built for a short
 * query against long documents, not two short-to-medium phrases. Matching
 * requires a leaf to match ALL of its (non-generic) words in the title
 * (see bestLeafForTitle), and word equality allows only plural/gerund/
 * past-tense inflection of a shared prefix (see wordsMatch/
 * INFLECTION_SUFFIXES) — not arbitrary substring containment, which is what
 * let "sports" get absorbed into "powersports" and, later, "dress" into
 * "dressers" in earlier versions of this logic (both verified live by
 * sampling actual mismatched products, not assumed).
 *
 * Run with: npx tsx scripts/fix-cj-categories.ts
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

// Generic words that recur across MANY leaf names within one domain (every
// "Pet ___" leaf contains "pet") and so carry no discriminating power —
// without excluding them, a title just mentioning the domain word ties
// against dozens of unrelated specific leaves and picks one arbitrarily.
// Color words are the real root cause behind several of the worst
// mismatches (verified: "Blue" is a completely legitimate exact word in
// both a "-Blue" color variant title and the leaf name "Anti-Blue Light
// Protectors" — a color adjective and an unrelated product category can
// share a word by pure coincidence far more often than any other word
// class, because nearly every variant title contains one). A product's
// color should never be what determines its category, so these are
// excluded outright rather than chasing each individual collision.
const COLOR_WORDS = [
  "black", "white", "blue", "red", "green", "yellow", "pink", "purple", "orange", "gray", "grey",
  "brown", "gold", "silver", "beige", "khaki", "navy", "coffee", "cream", "ivory", "maroon", "teal",
  "violet", "indigo", "turquoise", "magenta", "lavender", "olive", "tan", "burgundy", "rose", "mint",
  "coral", "peach", "wine", "bronze", "copper", "charcoal", "multicolor", "multi",
];
// "short" specifically: verified live it matched "Shorts" (the garment leaf)
// via the plural-suffix rule in wordsMatch, but nearly every real-world
// occurrence of the bare singular is adjectival ("Short-sleeved",
// "Short Sleeve T-Shirt", "Short Dress") rather than a reference to the
// garment itself — genuine shorts products still say the plural "shorts"
// in their title, so excluding the singular loses no real matches.
const STOPWORDS = new Set(["pet", "the", "and", "for", "with", "new", "set", "pcs", "pack", "size", "color", "style", "option", "all", "one", "two", "short", ...COLOR_WORDS]);

function words(s: string, minLength = 3): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= minLength && !STOPWORDS.has(w));
}

// Suffixes that turn one word into an inflected form of the SAME word
// (plural/gerund/past-tense) rather than a different, derived word. Deliberately
// excludes "er"/"ers" even though it's a common English suffix: agentive/
// instrumental nouns regularly drift in meaning from their root ("dress" ->
// "dresser"/"dressers" — verified live, a garment "Dress" title matched the
// furniture "Dressers" leaf purely because "dress" is a literal prefix of
// "dressers" and the two are within the old length-ratio threshold).
// "ing"/"ed" deliberately excluded despite being real English inflections:
// verified live that "car" + "ing" spells "caring" (a real word, derived
// from "care", not "car") and matched a coffee-cup product into "Car
// Covers" purely on that coincidence. Plain "s"/"es" pluralization doesn't
// have this failure mode — every verified legitimate case (cover/covers,
// car/cars, swimsuit/swimsuits, glass/glasses) only ever needed those two.
const INFLECTION_SUFFIXES = new Set(["", "s", "es"]);

function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  if (!longer.startsWith(shorter)) return false;
  return INFLECTION_SUFFIXES.has(longer.slice(shorter.length));
}

interface LeafCategory {
  id: string;
  name: string;
  topSlug: string;
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
    leaves.push({ id: row.id, name: row.name, topSlug: top.slug, childSlug: child.slug, grandchildSlug: row.slug });
  }
  return leaves;
}

// Words that are individually too generic to trust as a lone match signal —
// confirmed live: "covers" alone matched swimsuits, pet cone collars, a
// badminton racket cover, and a fish-tank net cover into "Car Covers",
// none of which ever mentioned "car". Excluded only from the fallback
// partial-match tier below (see bestLeafForTitle) — a full match still
// requires every leaf word, so "Car Covers" itself is unaffected as long
// as "car" is also present in the title.
const AMBIGUOUS_WORDS = new Set(["cover", "covers"]);

/**
 * Two-tier match: prefer a leaf where ALL of its words appear in the title
 * (tier 1). If none exists, fall back to a leaf where a STRICT MAJORITY of
 * its words appear (tier 2) — not just one, which was tried first and
 * verified live to reintroduce the exact single-word-coincidence bug tier 1
 * exists to prevent, just via a different word each time ("winter" alone
 * matching "Winter Tires" onto pet clothing, "bags" alone matching
 * "Sleeping Bags for Kids" onto a pet travel bag, "floor" alone matching
 * "Floor Mats" onto loose-fit pants). For a 2-word leaf this makes tier 2
 * equivalent to tier 1 (both words required); it only adds rescue value for
 * leaves with 3+ words, where 1-of-3 was clearly too weak but 2-of-3 is a
 * reasonable partial signal. This still exists so a product doesn't get
 * stuck forever in a stale wrong category from an earlier, looser run just
 * because no leaf achieves a full match.
 */
// "&"/"and" inside a leaf name lists independent alternatives ("Mugs &
// Cups" = a mug OR a cup, "Brushes & Combs" = a brush OR a comb), not a
// single compound noun phrase where every word describes the same thing
// ("Car Covers", "Wine Glasses"). Verified live: a coffee-cup product's
// title only said "cup", never "mug" — requiring the whole leaf name as
// one word set meant it could never match "Mugs & Cups" at all and stayed
// stuck in a stale wrong category. Splitting into groups and requiring a
// full/majority match within any ONE group fixes this without weakening
// the compound-phrase case, since a leaf with no "&"/"and" just yields a
// single group identical to the old flat word list.
function leafWordGroups(name: string): string[][] {
  return name
    .split(/\s*(?:&|\band\b)\s*/i)
    .map((segment) => words(segment, 3))
    .filter((group) => group.length > 0);
}

/**
 * Two-tier match: prefer a leaf with a word-group (see leafWordGroups)
 * where ALL of its words appear in the title (tier 1). If none exists,
 * fall back to a leaf with a group where a STRICT MAJORITY of its words
 * appear (tier 2) — not just one, which was tried first and verified live
 * to reintroduce the exact single-word-coincidence bug tier 1 exists to
 * prevent, just via a different word each time ("winter" alone matching
 * "Winter Tires" onto pet clothing, "bags" alone matching "Sleeping Bags
 * for Kids" onto a pet travel bag, "floor" alone matching "Floor Mats"
 * onto loose-fit pants). For a 2-word group this makes tier 2 equivalent
 * to tier 1 (both words required); it only adds rescue value for groups
 * with 3+ words, where 1-of-3 was clearly too weak but 2-of-3 is a
 * reasonable partial signal. This still exists so a product doesn't get
 * stuck forever in a stale wrong category from an earlier, looser run just
 * because no leaf achieves a full match.
 */
function bestLeafForTitle(titleWords: string[], candidates: LeafCategory[]): { leaf: LeafCategory; score: number } | null {
  let bestFull: { leaf: LeafCategory; score: number } | null = null;
  let bestPartial: { leaf: LeafCategory; score: number } | null = null;
  for (const leaf of candidates) {
    for (const leafWords of leafWordGroups(leaf.name)) {
      const score = leafWords.filter((lw) => titleWords.some((tw) => wordsMatch(tw, lw))).length;
      // ALL of a group's words must appear, not just one — a single shared
      // word is too often a coincidence between unrelated domains
      // (verified live: "Car Covers" — leaf words "car"+"covers" — matched
      // swimsuits and pet cone collars on "cover"/"covers" alone, without
      // "car" ever appearing in either title; "covers" is a common word in
      // its own right, unrelated to cars specifically). Requiring the full
      // set means a product only lands here if its title actually says
      // "car" somewhere too.
      if (score === leafWords.length && (!bestFull || score > bestFull.score)) bestFull = { leaf, score };

      const safeLeafWords = leafWords.filter((w) => !AMBIGUOUS_WORDS.has(w));
      if (safeLeafWords.length === 0) continue;
      const partialScore = safeLeafWords.filter((lw) => titleWords.some((tw) => wordsMatch(tw, lw))).length;
      if (partialScore > safeLeafWords.length / 2 && (!bestPartial || partialScore > bestPartial.score)) bestPartial = { leaf, score: partialScore };
    }
  }
  return bestFull ?? bestPartial;
}

async function main() {
  const allLeaves = await loadLeafCategories();
  const products = await db
    .select({ id: schema.products.id, title: schema.products.title, categoryId: schema.products.categoryId })
    .from(schema.products)
    .where(eq(schema.products.brandId, "cj-marketplace"));

  console.log(`Re-deriving categories for ${products.length} CJ products from their titles...\n`);

  let changed = 0;
  let unresolved = 0;
  for (const product of products) {
    const match = bestLeafForTitle(words(product.title), allLeaves);
    if (!match) {
      unresolved++;
      continue;
    }
    if (match.leaf.id === product.categoryId) continue;
    await db
      .update(schema.products)
      .set({ categoryId: match.leaf.id, categorySlugPath: [match.leaf.topSlug, match.leaf.childSlug, match.leaf.grandchildSlug] })
      .where(eq(schema.products.id, product.id));
    changed++;
  }

  console.log(`Changed ${changed} category assignments. ${unresolved} titles had no word-match anywhere and were left unchanged.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
