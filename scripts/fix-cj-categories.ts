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
 * uses length-ratio-gated substring containment: "hat"/"hats" and
 * "scarf"/"scarves" (near-equal length) still match, but "sports" isn't
 * absorbed into the unrelated "powersports" (a 6-vs-11-character mismatch)
 * the way naive substring containment allowed in the first version of this
 * logic — that bug is what produced the dumping grounds in the first place.
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
const STOPWORDS = new Set(["pet", "the", "and", "for", "with", "new", "set", "pcs", "pack", "size", "color", "style", "option", "all", "one", "two", ...COLOR_WORDS]);

function words(s: string, minLength = 3): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= minLength && !STOPWORDS.has(w));
}

/** True if a and b are close enough in length that containment is meaningful (blocks e.g. "car" swallowing "scarf", or "sports" swallowing "powersports"). */
function lengthCompatible(a: string, b: string): boolean {
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return shorter.length / longer.length >= 0.6;
}

function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (!lengthCompatible(a, b)) return false;
  return a.includes(b) || b.includes(a);
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

/** Best-scoring leaf by count of matched words, requiring at least 1; ties keep the FIRST candidate seen (stable, not random) rather than whatever iteration order happens to produce. */
function bestLeafForTitle(titleWords: string[], candidates: LeafCategory[]): { leaf: LeafCategory; score: number } | null {
  let best: { leaf: LeafCategory; score: number } | null = null;
  for (const leaf of candidates) {
    // Leaf words need a higher minimum length than title words — a short
    // leaf-name word (e.g. "Blu" in "Blu-ray") is far more likely to
    // coincidentally substring-match an unrelated common word in some
    // title (verified: "Blu" matched "Blue" as a color variant, hijacking
    // blue-colored products across the whole catalog into "Blu-ray").
    const leafWords = words(leaf.name, 4);
    if (leafWords.length === 0) continue;
    const score = leafWords.filter((lw) => titleWords.some((tw) => wordsMatch(tw, lw))).length;
    if (score > 0 && (!best || score > best.score)) best = { leaf, score };
  }
  return best;
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
