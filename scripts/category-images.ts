/**
 * Gives every category a picture of something it actually contains.
 *
 * Category artwork has always been picsum placeholders seeded by slug — random
 * stock photography with no relationship to the products underneath. Now that
 * products are filed by CJ's own category id rather than by guessing at their
 * titles, the products in a category are genuinely alike, so the category can
 * simply be illustrated by its own stock.
 *
 * Two shapes, because the page uses the two levels differently:
 *
 *   Sections and categories appear only in tiles (4:3 and square). One product
 *   photo, letterboxed onto white at 800x800.
 *
 *   Departments also fill the page-top banner, and the banner is a ~6:1 slice
 *   of the same file that the homepage grid shows whole at 4:3. A single photo
 *   cannot serve both. Three photos in a row can: the banner crops away the top
 *   and bottom but still shows three upright panels, so the composition holds
 *   at either aspect. The three come from three different sections, so a
 *   department is represented by its range rather than by one product.
 *
 * White canvas is deliberate — CJ shoots on white, so letterboxing is invisible
 * and the result reads as a catalogue shot rather than a photo with borders.
 *
 * Files are written as ULIDs under UPLOAD_DIR/categories, the same place and
 * naming the admin uploader uses, so admin can overwrite any of these by hand
 * afterwards. A regenerated image gets a new ULID and therefore a new URL,
 * which is what keeps next/image from serving the previous art forever.
 *
 * Skips any category that already has an image, so a re-run is cheap and never
 * clobbers something an admin chose. Dry run by default; --apply writes.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import sharp from "sharp";
import { ulid } from "ulid";
import * as schema from "../db/schema";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");
const LIMIT = Number(process.env.CATEGORY_IMAGE_LIMIT ?? Infinity);

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), ".uploads");
const OUT_DIR = path.join(UPLOAD_DIR, "categories");

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const TILE = 800;
/** 4:3, so the homepage grid shows the whole montage without cropping. */
const BANNER_W = 1200;
const BANNER_H = 900;
const PANEL = 360;
const PANEL_GAP = 20;
/** How many products to try before giving up on a category — CJ URLs do rot. */
const MAX_ATTEMPTS = 8;
const CONCURRENCY = 6;

interface Candidate {
  id: string;
  url: string;
  score: number;
}

/** Fetches a product photo, from CJ's CDN or from our own uploads. */
async function loadPhoto(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith("/uploads/")) {
      // Own-brand products, uploaded through admin rather than sourced.
      const [, , folder, file] = url.split("/");
      return await readFile(path.join(UPLOAD_DIR, folder, file));
    }
    if (!url.startsWith("https://")) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.byteLength > 0 ? buf : null;
  } catch {
    return null;
  }
}

/** Scales a photo to fit a box and centres it on white, never cropping it. */
async function letterbox(photo: Buffer, w: number, h: number): Promise<Buffer> {
  return sharp(photo)
    .resize(w, h, { fit: "contain", background: WHITE })
    .flatten({ background: WHITE })
    .toBuffer();
}

/**
 * Walks candidates in order until one yields a usable photo.
 *
 * About a third of picks are CJ's marketing graphics rather than product
 * shots — spec callouts, before-and-after panels, untranslated copy. There is
 * no filter for them here, because the obvious one does not work: the graphics
 * measure 800x800 exactly like the clean shots do, so aspect ratio separates
 * nothing. Selecting on it only shuffled picks, once for the worse. Sorting
 * photographs from sales collateral needs a human eye, and admin already has
 * the category image uploader for that.
 */
async function firstUsable(
  candidates: Candidate[],
  seen: Set<string>,
): Promise<{ id: string; photo: Buffer } | null> {
  let tried = 0;
  for (const c of candidates) {
    if (seen.has(c.id) || tried >= MAX_ATTEMPTS) continue;
    tried++;
    const photo = await loadPhoto(c.url);
    if (photo) return { id: c.id, photo };
  }
  return null;
}

async function buildTile(candidates: Candidate[]): Promise<Buffer | null> {
  const pick = await firstUsable(candidates, new Set());
  if (!pick) return null;
  return sharp(await letterbox(pick.photo, TILE, TILE)).webp({ quality: 82 }).toBuffer();
}

/**
 * Three products in a row on white. Callers pass one candidate list per
 * section so the panels come from different parts of the department.
 */
async function buildBanner(groups: Candidate[][]): Promise<Buffer | null> {
  const used = new Set<string>();
  const panels: Buffer[] = [];
  for (const group of groups) {
    if (panels.length === 3) break;
    const pick = await firstUsable(group, used);
    if (!pick) continue;
    used.add(pick.id);
    panels.push(await letterbox(pick.photo, PANEL, PANEL));
  }
  if (panels.length === 0) return null;

  const spread = panels.length * PANEL + (panels.length - 1) * PANEL_GAP;
  const left0 = Math.round((BANNER_W - spread) / 2);
  const top = Math.round((BANNER_H - PANEL) / 2);

  return sharp({ create: { width: BANNER_W, height: BANNER_H, channels: 3, background: WHITE } })
    .composite(panels.map((input, i) => ({ input, left: left0 + i * (PANEL + PANEL_GAP), top })))
    .webp({ quality: 82 })
    .toBuffer();
}

async function main() {
  console.log(APPLY ? "APPLYING\n" : "DRY RUN — no files written, no rows updated\n");

  const cats = await db.select().from(schema.categories);
  const byId = new Map(cats.map((c) => [c.id, c]));
  const childrenOf = new Map<string, string[]>();
  for (const c of cats) {
    if (!c.parentId) continue;
    const list = childrenOf.get(c.parentId) ?? [];
    list.push(c.id);
    childrenOf.set(c.parentId, list);
  }

  // Only products a customer can actually buy get to represent a category.
  const rows = await db
    .select({
      id: schema.products.id,
      categoryId: schema.products.categoryId,
      images: schema.products.images,
      ratingCount: schema.products.ratingCount,
      ratingValue: schema.products.ratingValue,
    })
    .from(schema.products)
    .innerJoin(schema.productMeta, eq(schema.productMeta.productId, schema.products.id))
    .where(and(eq(schema.productMeta.visibility, "visible"), eq(schema.productMeta.status, "active")));

  /**
   * A well-reviewed listing with several photos is likelier to have a clean
   * primary shot than one with none — a proxy for photo quality, which is not
   * something the database records.
   */
  const byLeaf = new Map<string, Candidate[]>();
  for (const r of rows) {
    const images = Array.isArray(r.images) ? r.images : [];
    if (!images[0]) continue;
    const list = byLeaf.get(r.categoryId) ?? [];
    list.push({
      id: r.id,
      url: images[0],
      score: r.ratingCount * 10 + Number(r.ratingValue) * 20 + Math.min(images.length, 8),
    });
    byLeaf.set(r.categoryId, list);
  }
  for (const list of byLeaf.values()) list.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const leavesUnder = (id: string): string[] => {
    const cat = byId.get(id);
    if (!cat) return [];
    if (cat.level === "grandchild") return [id];
    return (childrenOf.get(id) ?? []).flatMap(leavesUnder);
  };

  const targets = cats.filter((c) => FORCE || !c.image).slice(0, LIMIT);
  const already = cats.length - cats.filter((c) => FORCE || !c.image).length;
  console.log(`${cats.length} categories · ${already} already have an image · ${targets.length} to generate`);
  console.log(`writing to ${OUT_DIR}\n`);

  if (!APPLY) {
    for (const level of ["top", "child", "grandchild"] as const) {
      const n = targets.filter((c) => c.level === level).length;
      const shape = level === "top" ? `${BANNER_W}x${BANNER_H} three-panel banner` : `${TILE}x${TILE} tile`;
      console.log(`  ${String(n).padStart(3)} ${level.padEnd(11)} ${shape}`);
    }
    const sample = targets.filter((c) => c.level === "grandchild").slice(0, 3);
    console.log("\nsample picks:");
    for (const c of sample) {
      const top = (byLeaf.get(c.id) ?? [])[0];
      console.log(`  ${c.name.slice(0, 30).padEnd(32)} ${top ? top.url : "NO CANDIDATE"}`);
    }
    const barren = targets.filter((c) => leavesUnder(c.id).every((l) => !(byLeaf.get(l) ?? []).length));
    console.log(`\ncategories with no sellable product to draw from: ${barren.length}`);
    console.log("Re-run with --apply to write.");
    await pool.end();
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  let done = 0;
  let failed = 0;
  const failures: string[] = [];
  const queue = [...targets];

  const worker = async () => {
    for (;;) {
      const cat = queue.shift();
      if (!cat) return;

      let out: Buffer | null = null;
      if (cat.level === "top") {
        // One candidate list per section, best sections first, so the three
        // panels span the department rather than clustering in one corner.
        const groups = (childrenOf.get(cat.id) ?? [])
          .map((childId) => leavesUnder(childId).flatMap((l) => byLeaf.get(l) ?? []).sort((a, b) => b.score - a.score))
          .filter((g) => g.length)
          .sort((a, b) => b.length - a.length);
        out = await buildBanner(groups);
      } else {
        const candidates = leavesUnder(cat.id)
          .flatMap((l) => byLeaf.get(l) ?? [])
          .sort((a, b) => b.score - a.score);
        out = await buildTile(candidates);
      }

      if (!out) {
        failed++;
        failures.push(`${cat.level} ${cat.slug}`);
        continue;
      }

      const filename = `${ulid()}.webp`;
      await writeFile(path.join(OUT_DIR, filename), out);
      await db
        .update(schema.categories)
        .set({ image: `/uploads/categories/${filename}` })
        .where(eq(schema.categories.id, cat.id));

      done++;
      if (done % 50 === 0) console.log(`  ${done}/${targets.length} written`);
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\nwrote ${done} images, ${failed} could not be built`);
  if (failures.length) console.log(`  ${failures.slice(0, 20).join("\n  ")}`);

  const all = await db.select({ image: schema.categories.image }).from(schema.categories);
  console.log(`categories with an image: ${all.filter((c) => c.image).length}/${all.length}`);

  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
