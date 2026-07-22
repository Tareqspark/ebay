import { cache } from "react";
import { db } from "@/db";
import { categories as categoriesTable } from "@/db/schema";
import { getProducts } from "@/lib/admin/data";

export type CategoryLevel = "top" | "child" | "grandchild";

export interface CategoryTreeRow {
  id: string;
  parentId: string | null;
  level: CategoryLevel;
  name: string;
  slug: string;
  slugPath: string[];
  iconName: string | null;
  image: string | null;
  description: string | null;
  featured: boolean;
  sortOrder: number;
  productCount: number;
  children: CategoryTreeRow[];
}

export const getCategoryTree = cache(async (): Promise<CategoryTreeRow[]> => {
  const [rows, products] = await Promise.all([
    db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder),
    getProducts(),
  ]);

  const countByPath = new Map<string, number>();
  for (const product of products) {
    const [top, child, grandchild] = product.categorySlugPath;
    countByPath.set(top, (countByPath.get(top) ?? 0) + 1);
    if (child) countByPath.set(`${top}/${child}`, (countByPath.get(`${top}/${child}`) ?? 0) + 1);
    if (grandchild) countByPath.set(`${top}/${child}/${grandchild}`, (countByPath.get(`${top}/${child}/${grandchild}`) ?? 0) + 1);
  }

  const byId = new Map<string, CategoryTreeRow>();
  for (const row of rows) {
    byId.set(row.id, {
      id: row.id,
      parentId: row.parentId,
      level: row.level,
      name: row.name,
      slug: row.slug,
      slugPath: [],
      iconName: row.iconName,
      image: row.image,
      description: row.description,
      featured: row.featured ?? false,
      sortOrder: row.sortOrder,
      productCount: 0,
      children: [],
    });
  }

  // Three top-down passes, not one pass over `rows` in arbitrary (sortOrder)
  // order — a child row can appear before its parent row in that ordering,
  // which would compute an incomplete slugPath if we tried to build the
  // tree in a single pass.
  const tops: CategoryTreeRow[] = [];
  for (const row of rows) {
    if (row.level !== "top") continue;
    const node = byId.get(row.id)!;
    node.slugPath = [node.slug];
    tops.push(node);
  }
  for (const row of rows) {
    if (row.level !== "child" || !row.parentId) continue;
    const node = byId.get(row.id)!;
    const parent = byId.get(row.parentId);
    if (!parent) continue;
    node.slugPath = [...parent.slugPath, node.slug];
    parent.children.push(node);
  }
  for (const row of rows) {
    if (row.level !== "grandchild" || !row.parentId) continue;
    const node = byId.get(row.id)!;
    const parent = byId.get(row.parentId);
    if (!parent) continue;
    node.slugPath = [...parent.slugPath, node.slug];
    parent.children.push(node);
  }

  function withCounts(node: CategoryTreeRow): CategoryTreeRow {
    node.productCount = countByPath.get(node.slugPath.join("/")) ?? 0;
    node.children.forEach(withCounts);
    return node;
  }
  tops.forEach(withCounts);

  return tops;
});

export async function getCategoryTotals() {
  const rows = await db.select({ level: categoriesTable.level }).from(categoriesTable);
  const top = rows.filter((r) => r.level === "top").length;
  const child = rows.filter((r) => r.level === "child").length;
  const grandchild = rows.filter((r) => r.level === "grandchild").length;
  return { top, child, grandchild, total: rows.length };
}
