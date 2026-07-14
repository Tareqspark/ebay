import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RAW_BRANDS } from "./brand-source.mjs";
import { slugify } from "./slugify.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "app", "data", "brands.ts");

export const BRANDS = RAW_BRANDS.map(([name, categorySlugs]) => ({
  id: slugify(name),
  name,
  slug: slugify(name),
  categorySlugs,
}));

function tsString(value) {
  return JSON.stringify(value);
}

const brandLines = BRANDS.map(
  (b) =>
    `  { id: ${tsString(b.id)}, name: ${tsString(b.name)}, slug: ${tsString(
      b.slug
    )}, categorySlugs: ${tsString(b.categorySlugs)} },`
).join("\n");

const content = `// AUTO-GENERATED FILE. Do not edit directly.
// Source data lives in scripts/brand-source.mjs — run
// \`node scripts/generate-brands.mjs\` to regenerate.
import type { Brand } from "@/lib/types";

export const BRANDS: Brand[] = [
${brandLines}
];

export function getBrandById(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id);
}

export function getBrandsForCategory(categorySlug: string, limit = 12): Brand[] {
  return BRANDS.filter((b) => b.categorySlugs.includes(categorySlug)).slice(0, limit);
}
`;

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, content, "utf-8");
  console.log(`Generated ${OUT_PATH}`);
  console.log(`Brands: ${BRANDS.length}`);
}
