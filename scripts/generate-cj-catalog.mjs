import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RAW } from "./category-source.mjs";
import { PRICE_RANGES } from "./product-data.mjs";
import { CJ_SHIPPING_LINES, CJ_TITLE_MODIFIERS } from "./cj-source.mjs";
import { slugify } from "./slugify.mjs";
import { createRng } from "./rng.mjs";

// This file is intentionally NOT under app/data — it's loaded server-only via
// fs (see lib/admin/cj-catalog.ts), never imported as a JS/TS module, so a
// 50k-item catalog never has a chance of being bundled toward the client.
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "data", "cj-catalog.json");

const TARGET_COUNT = 50000;
const { rand, pick, randInt, chance } = createRng(731004);

const cnLines = CJ_SHIPPING_LINES.filter((l) => l.fromWarehouse === "CN").map((l) => l.id);
const usLines = CJ_SHIPPING_LINES.filter((l) => l.fromWarehouse === "US").map((l) => l.id);

// Flatten every leaf (grandchild) category with its top-level slug.
const leaves = [];
for (const [topName, , , , children] of RAW) {
  const topSlug = slugify(topName);
  for (const [, grandchildren] of children) {
    for (const gcName of grandchildren) {
      leaves.push({ topSlug, gcName });
    }
  }
}

function priceFor(topSlug) {
  const [min, max] = PRICE_RANGES[topSlug] ?? [9, 199];
  return min + rand() * (max - min);
}

const items = [];
let seq = 0;
const usedTitles = new Set();

while (items.length < TARGET_COUNT) {
  const leaf = leaves[Math.floor(rand() * leaves.length)];
  const modifier = chance(0.6) ? pick(CJ_TITLE_MODIFIERS) : null;
  const variantSuffix = chance(0.3) ? ` V${randInt(1, 4)}` : "";
  let title = modifier ? `${modifier} ${leaf.gcName}${variantSuffix}` : `${leaf.gcName}${variantSuffix}`;

  let slug = slugify(title);
  if (usedTitles.has(slug)) {
    seq += 1;
    title = `${title} #${seq}`;
    slug = slugify(title);
  }
  usedTitles.add(slug);

  const suggestedRetail = Math.round(priceFor(leaf.topSlug) * 100) / 100;
  const costFactor = 0.3 + rand() * 0.25; // CJ cost ~30-55% of suggested retail
  const cost = Math.round(suggestedRetail * costFactor * 100) / 100;
  const sourceWarehouse = chance(0.72) ? "CN" : "US";
  const shippingLineId = sourceWarehouse === "CN" ? pick(cnLines) : pick(usLines);
  const stockRoll = rand();
  const stockStatus = stockRoll < 0.9 ? "in_stock" : stockRoll < 0.97 ? "low_stock" : "out_of_stock";

  seq += 1;
  const id = `cj-${100000 + seq}`;

  items.push({
    id,
    cjProductId: `CJ${randInt(1000000, 9999999)}`,
    title,
    image: `https://picsum.photos/seed/${slug}-cj/500/500`,
    categorySlug: leaf.topSlug,
    cost,
    suggestedRetail,
    variantCount: randInt(1, 6),
    sourceWarehouse,
    shippingLineId,
    stockStatus,
    rating: Math.round((3.3 + rand() * 1.7) * 10) / 10,
    imported: chance(0.06),
  });
}

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(items), "utf-8");

console.log(`Generated ${OUT_PATH}`);
console.log(`Total CJ catalog items: ${items.length}`);
