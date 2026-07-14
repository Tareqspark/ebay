import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RAW } from "./category-source.mjs";
import { slugify } from "./slugify.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "app", "data", "categories.ts");

const usedIds = new Set();
function uniqueId(base) {
  let id = base;
  let n = 2;
  while (usedIds.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  usedIds.add(id);
  return id;
}

const iconSet = new Set();
let topCount = 0;
let childCount = 0;
let grandchildCount = 0;

const topCategories = RAW.map(([name, icon, description, featured, children]) => {
  const topSlug = slugify(name);
  const topId = uniqueId(topSlug);
  iconSet.add(icon);
  topCount += 1;

  const childCategories = children.map(([childName, grandchildren]) => {
    const childSlug = slugify(childName);
    const childId = uniqueId(`${topSlug}-${childSlug}`);
    childCount += 1;

    const grandchildCategories = grandchildren.map((gcName) => {
      const gcSlug = slugify(gcName);
      const gcId = uniqueId(`${topSlug}-${childSlug}-${gcSlug}`);
      grandchildCount += 1;
      return { id: gcId, name: gcName, slug: gcSlug };
    });

    return {
      id: childId,
      name: childName,
      slug: childSlug,
      children: grandchildCategories,
    };
  });

  return {
    id: topId,
    name,
    slug: topSlug,
    icon,
    image: `https://picsum.photos/seed/${topSlug}/800/500`,
    description,
    featured,
    children: childCategories,
  };
});

const iconImportNames = Array.from(iconSet).sort();

function tsString(value) {
  return JSON.stringify(value);
}

function renderGrandchild(gc, indent) {
  return `${indent}{ id: ${tsString(gc.id)}, name: ${tsString(gc.name)}, slug: ${tsString(gc.slug)} }`;
}

function renderChild(child, indent) {
  const gcIndent = indent + "  ";
  const gcLines = child.children
    .map((gc) => renderGrandchild(gc, gcIndent + "  "))
    .join(",\n");
  return `${indent}{
${indent}  id: ${tsString(child.id)},
${indent}  name: ${tsString(child.name)},
${indent}  slug: ${tsString(child.slug)},
${indent}  children: [
${gcLines}
${indent}  ],
${indent}}`;
}

function renderTop(top, indent) {
  const childIndent = indent + "  ";
  const childLines = top.children
    .map((child) => renderChild(child, childIndent + "  "))
    .join(",\n");
  return `${indent}{
${indent}  id: ${tsString(top.id)},
${indent}  name: ${tsString(top.name)},
${indent}  slug: ${tsString(top.slug)},
${indent}  icon: ${top.icon},
${indent}  image: ${tsString(top.image)},
${indent}  description: ${tsString(top.description)},
${indent}  featured: ${top.featured},
${indent}  children: [
${childLines}
${indent}  ],
${indent}}`;
}

const categoriesBody = topCategories
  .map((top) => renderTop(top, "  "))
  .join(",\n");

const header = `// AUTO-GENERATED FILE. Do not edit directly.
// Source data lives in scripts/category-source.mjs — run
// \`node scripts/generate-categories.mjs\` to regenerate.
import type { LucideIcon } from "lucide-react";
import {
${iconImportNames.map((n) => `  ${n},`).join("\n")}
} from "lucide-react";

export interface GrandchildCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ChildCategory {
  id: string;
  name: string;
  slug: string;
  children: GrandchildCategory[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  image: string;
  description: string;
  featured: boolean;
  children: ChildCategory[];
}

export const CATEGORIES: Category[] = [
${categoriesBody}
];
`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, header, "utf-8");

console.log(`Generated ${OUT_PATH}`);
console.log(`Top-level categories: ${topCount}`);
console.log(`Child categories: ${childCount}`);
console.log(`Grandchild categories: ${grandchildCount}`);
console.log(`Total category nodes: ${topCount + childCount + grandchildCount}`);
console.log(`Distinct icons used: ${iconImportNames.length}`);
