import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProducts } from "./product-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "app", "data", "products.ts");

const products = generateProducts();

function tsString(value) {
  return JSON.stringify(value);
}

function renderProduct(p) {
  const originalPriceLine = p.originalPrice !== undefined ? `\n    originalPrice: ${p.originalPrice},` : "";
  return `  {
    id: ${tsString(p.id)},
    slug: ${tsString(p.slug)},
    title: ${tsString(p.title)},
    brandId: ${tsString(p.brandId)},
    price: ${p.price},${originalPriceLine}
    currency: "USD",
    images: ${tsString(p.images)},
    review: { rating: ${p.rating}, count: ${p.reviewCount} },
    categorySlugPath: ${tsString(p.categorySlugPath)},
    isNewArrival: ${p.isNewArrival},
    isBestSeller: ${p.isBestSeller},
    isTrending: ${p.isTrending},
    isFlashSale: ${p.isFlashSale},
    isDeal: ${p.isDeal},
    freeShipping: ${p.freeShipping},
    stock: ${p.stock},
    description: ${tsString(p.description)},
    features: ${tsString(p.features)},
  }`;
}

const body = products.map(renderProduct).join(",\n");

const content = `// AUTO-GENERATED FILE. Do not edit directly.
// Source logic lives in scripts/product-data.mjs — run
// \`node scripts/generate-products.mjs\` to regenerate.
import type { Product } from "@/lib/types";

export const PRODUCTS: Product[] = [
${body}
];
`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, content, "utf-8");

console.log(`Generated ${OUT_PATH}`);
console.log(`Total products: ${products.length}`);
