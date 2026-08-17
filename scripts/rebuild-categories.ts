/**
 * Rebuilds the category tree on the supplier's structure and re-files every
 * product into it.
 *
 * Our tree had 1,416 leaves; CJ, our only supplier, has 577. Being 2.5x finer
 * than the catalogue it is filled from caused both symptoms at once: 715
 * leaves could never fill, and filing had to choose between near-duplicate
 * destinations, which it got wrong 66% of the time.
 *
 * Three decisions worth stating:
 *
 *   Only categories that hold products are created. Mirroring all 577 would
 *   reintroduce empty categories on day one; the tree grows as sourcing
 *   fills it.
 *
 *   Our names are kept wherever one plausibly matches, because CJ's are
 *   supplier vocabulary — "Vulcanize Shoes", "Beauty Tools", "Woman Boots".
 *   Matching is by id, so the label is free to differ. Anything without a
 *   match uses a cleaned-up CJ name and can be renamed in the admin.
 *
 *   Products with no CJ category — our own-brand items, and anything CJ has
 *   delisted — keep the category they are in, and those nodes are preserved.
 *   Nothing is orphaned.
 *
 * Dry run by default. Pass --apply to write, and take a database backup
 * first: this replaces the category tree and rewrites every product's
 * category.
 */
import { inArray, isNotNull, and, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";
import { slugify } from "../lib/slugify";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const APPLY = process.argv.includes("--apply");

interface CjNode {
  id: string;
  name: string;
  level: "top" | "child" | "grandchild";
  parentCjId: string | null;
}

async function fetchCjTree(): Promise<CjNode[]> {
  const auth = await (
    await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
    })
  ).json();
  if (!auth.result) throw new Error(`CJ authentication failed: ${auth.message}`);

  const res = await fetch(`${CJ_BASE}/product/getCategory`, { headers: { "CJ-Access-Token": auth.data.accessToken } });
  const tops = (await res.json()).data ?? [];

  const nodes: CjNode[] = [];
  for (const t of tops) {
    nodes.push({ id: t.categoryFirstId, name: t.categoryFirstName, level: "top", parentCjId: null });
    for (const s of t.categoryFirstList ?? []) {
      nodes.push({ id: s.categorySecondId, name: s.categorySecondName, level: "child", parentCjId: t.categoryFirstId });
      for (const th of s.categorySecondList ?? []) {
        nodes.push({ id: th.categoryId, name: th.categoryName, level: "grandchild", parentCjId: s.categorySecondId });
      }
    }
  }
  return nodes;
}

/**
 * CJ's labels carry supplier habits — a stray "·", "Woman" where a shopper
 * expects "Women's", inconsistent apostrophes. Cleaned rather than rewritten;
 * anything genuinely awkward is renamed in the admin afterwards.
 */
function tidyName(raw: string): string {
  return raw
    .replace(/[·•]+\s*$/, "")
    .replace(/\s*&\s*/g, " & ")
    .replace(/\bWomans?\b/gi, "Women's")
    .replace(/\bWomens\b/g, "Women's")
    .replace(/\bMens\b/g, "Men's")
    .replace(/\s+/g, " ")
    .trim();
}

const GENERIC = new Set(["and", "the", "for", "accessories", "other", "supplies", "parts", "sets", "set", "kit", "kits"]);
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length >= 3 && !GENERIC.has(x));

/**
 * Reuses one of our existing names when it clearly denotes the same thing.
 * Requires every meaningful word to correspond in both directions, so
 * "Scarves & Wraps" can adopt our "Scarves" but "Camera Drones" never adopts
 * "DSLR Cameras" — the loose overlap that caused the original mis-filing.
 */
function preferOurName(cjName: string, ourNames: string[]): string | null {
  const cw = words(cjName);
  if (cw.length === 0) return null;
  for (const ours of ourNames) {
    const ow = words(ours);
    if (ow.length === 0) continue;
    const shared = ow.filter((o) => cw.some((c) => c === o || c.startsWith(o) || o.startsWith(c)));
    if (shared.length === ow.length && shared.length === cw.length) return ours;
  }
  return null;
}

async function main() {
  console.log(APPLY ? "APPLYING — the tree will be replaced\n" : "DRY RUN — nothing will be written\n");

  const cjNodes = await fetchCjTree();
  const cjById = new Map(cjNodes.map((n) => [n.id, n]));
  console.log(`CJ tree: ${cjNodes.filter((n) => n.level === "top").length} / ${cjNodes.filter((n) => n.level === "child").length} / ${cjNodes.filter((n) => n.level === "grandchild").length}`);

  // Which CJ categories our products actually sit in.
  const rows = await db
    .select({ productId: schema.productMeta.productId, cjCategoryId: schema.productMeta.cjCategoryId })
    .from(schema.productMeta)
    .where(and(isNotNull(schema.productMeta.cjCategoryId), ne(schema.productMeta.cjCategoryId, "UNKNOWN")));

  const usedLeafIds = new Set(rows.map((r) => r.cjCategoryId!).filter((id) => cjById.has(id)));
  const unresolved = rows.filter((r) => !cjById.has(r.cjCategoryId!)).length;
  console.log(`products with a usable CJ category: ${rows.length - unresolved}  (${unresolved} reference a category CJ's tree doesn't list)`);
  console.log(`distinct CJ leaves in use: ${usedLeafIds.size}\n`);

  // Keep used leaves plus their ancestors — nothing else.
  const keep = new Set<string>();
  for (const leafId of usedLeafIds) {
    let node = cjById.get(leafId);
    while (node) {
      keep.add(node.id);
      node = node.parentCjId ? cjById.get(node.parentCjId) : undefined;
    }
  }
  const planned = cjNodes.filter((n) => keep.has(n.id));
  console.log(`new tree: ${planned.filter((n) => n.level === "top").length} departments / ${planned.filter((n) => n.level === "child").length} sections / ${planned.filter((n) => n.level === "grandchild").length} categories`);

  // Products that have no CJ category keep where they are, so their existing
  // nodes must survive the rebuild.
  const existing = await db.select().from(schema.categories);
  const byId = new Map(existing.map((c) => [c.id, c]));
  const allProducts = await db.select({ id: schema.products.id, path: schema.products.categorySlugPath }).from(schema.products);
  const withCj = new Set(rows.filter((r) => cjById.has(r.cjCategoryId!)).map((r) => r.productId));
  const strandedPaths = new Set(
    allProducts.filter((p) => !withCj.has(p.id)).map((p) => (p.path as string[]).join("/"))
  );
  console.log(`products keeping their current category: ${allProducts.length - withCj.size} across ${strandedPaths.size} node(s)\n`);

  const ourLeafNames = existing.filter((c) => c.level === "grandchild").map((c) => c.name);
  const ourChildNames = existing.filter((c) => c.level === "child").map((c) => c.name);
  const ourTopNames = existing.filter((c) => c.level === "top").map((c) => c.name);

  let reused = 0;
  const nameFor = (n: CjNode) => {
    const pool = n.level === "top" ? ourTopNames : n.level === "child" ? ourChildNames : ourLeafNames;
    const ours = preferOurName(n.name, pool);
    if (ours) reused++;
    return ours ?? tidyName(n.name);
  };
  const names = new Map(planned.map((n) => [n.id, nameFor(n)]));
  console.log(`names: ${reused} reuse an existing Cartebay label, ${planned.length - reused} use a tidied supplier label`);

  console.log("\nsample of the new tree:");
  for (const top of planned.filter((n) => n.level === "top").slice(0, 3)) {
    console.log(`  ${names.get(top.id)}`);
    for (const mid of planned.filter((n) => n.parentCjId === top.id).slice(0, 2)) {
      console.log(`    ${names.get(mid.id)}`);
      for (const leaf of planned.filter((n) => n.parentCjId === mid.id).slice(0, 3)) {
        const n = rows.filter((r) => r.cjCategoryId === leaf.id).length;
        console.log(`      ${names.get(leaf.id)}  (${n} products)`);
      }
    }
  }

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply to write.");
    await pool.end();
    return;
  }

  // ---- write ----------------------------------------------------------
  const slugUsed = new Map<string, Set<string>>();
  const uniqueSlug = (parentKey: string, name: string) => {
    const set = slugUsed.get(parentKey) ?? new Set<string>();
    let slug = slugify(name) || "category";
    let i = 2;
    while (set.has(slug)) slug = `${slugify(name)}-${i++}`;
    set.add(slug);
    slugUsed.set(parentKey, set);
    return slug;
  };

  const newId = new Map<string, string>();
  const slugOf = new Map<string, string>();
  const inserts: (typeof schema.categories.$inferInsert)[] = [];
  let sort = 0;
  for (const level of ["top", "child", "grandchild"] as const) {
    for (const n of planned.filter((x) => x.level === level)) {
      const id = `cj-${n.id}`.slice(0, 191);
      const parentKey = n.parentCjId ? `cj-${n.parentCjId}` : "root";
      const slug = uniqueSlug(parentKey, names.get(n.id)!);
      newId.set(n.id, id);
      slugOf.set(n.id, slug);
      inserts.push({
        id,
        parentId: n.parentCjId ? newId.get(n.parentCjId)! : null,
        level,
        name: names.get(n.id)!,
        slug,
        cjCategoryId: n.id,
        iconName: level === "top" ? "Tag" : null,
        featured: level === "top",
        sortOrder: sort++,
      });
    }
  }

  // Categories that stranded products still point at are carried over intact.
  const keepOld = existing.filter((c) => {
    if (c.level !== "grandchild") return false;
    const child = c.parentId ? byId.get(c.parentId) : null;
    const top = child?.parentId ? byId.get(child.parentId) : null;
    return top && child && strandedPaths.has([top.slug, child.slug, c.slug].join("/"));
  });
  const keepOldIds = new Set<string>();
  for (const leaf of keepOld) {
    keepOldIds.add(leaf.id);
    const child = byId.get(leaf.parentId!);
    if (child) { keepOldIds.add(child.id); if (child.parentId) keepOldIds.add(child.parentId); }
  }
  console.log(`\npreserving ${keepOldIds.size} existing node(s) for products with no CJ category`);

  await db.transaction(async (tx) => {
    await tx.delete(schema.categories).where(
      keepOldIds.size ? and(ne(schema.categories.id, ""), inArray(schema.categories.id, existing.filter((c) => !keepOldIds.has(c.id)).map((c) => c.id))) : undefined
    );
    for (let i = 0; i < inserts.length; i += 200) await tx.insert(schema.categories).values(inserts.slice(i, i + 200));

    // Re-file every product that has a CJ category.
    const pathFor = (leafCjId: string): [string, string, string] | null => {
      const leaf = cjById.get(leafCjId);
      const mid = leaf?.parentCjId ? cjById.get(leaf.parentCjId) : null;
      const top = mid?.parentCjId ? cjById.get(mid.parentCjId) : null;
      if (!leaf || !mid || !top) return null;
      return [slugOf.get(top.id)!, slugOf.get(mid.id)!, slugOf.get(leaf.id)!];
    };
    let filed = 0;
    const byCategory = new Map<string, string[]>();
    for (const r of rows) {
      if (!cjById.has(r.cjCategoryId!)) continue;
      const list = byCategory.get(r.cjCategoryId!) ?? [];
      list.push(r.productId);
      byCategory.set(r.cjCategoryId!, list);
    }
    for (const [cjId, productIds] of byCategory) {
      const path = pathFor(cjId);
      if (!path) continue;
      for (let i = 0; i < productIds.length; i += 300) {
        await tx
          .update(schema.products)
          .set({ categoryId: newId.get(cjId)!, categorySlugPath: path })
          .where(inArray(schema.products.id, productIds.slice(i, i + 300)));
        filed += productIds.slice(i, i + 300).length;
      }
    }
    console.log(`re-filed ${filed} products into ${byCategory.size} categories`);
  });

  const [after] = await db.select({ n: schema.categories.id }).from(schema.categories).limit(1);
  console.log(`\ndone. categories table rebuilt${after ? "" : " (empty — investigate)"}`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
