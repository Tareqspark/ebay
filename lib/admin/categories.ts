import { cache } from "react";
import { getAdminCategories, getProducts } from "@/lib/admin/data";

export interface CategoryTreeRow {
  id: string;
  name: string;
  slug: string;
  slugPath: string[];
  level: 0 | 1 | 2;
  productCount: number;
  featured?: boolean;
  children: CategoryTreeRow[];
}

export const getCategoryTree = cache(async (): Promise<CategoryTreeRow[]> => {
  const [categories, products] = await Promise.all([getAdminCategories(), getProducts()]);

  const countByPath = new Map<string, number>();
  for (const product of products) {
    const [top, child, grandchild] = product.categorySlugPath;
    countByPath.set(top, (countByPath.get(top) ?? 0) + 1);
    countByPath.set(`${top}/${child}`, (countByPath.get(`${top}/${child}`) ?? 0) + 1);
    countByPath.set(`${top}/${child}/${grandchild}`, (countByPath.get(`${top}/${child}/${grandchild}`) ?? 0) + 1);
  }

  return categories.map((top) => ({
    id: top.id,
    name: top.name,
    slug: top.slug,
    slugPath: [top.slug],
    level: 0 as const,
    productCount: countByPath.get(top.slug) ?? 0,
    featured: top.featured,
    children: top.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      slugPath: [top.slug, child.slug],
      level: 1 as const,
      productCount: countByPath.get(`${top.slug}/${child.slug}`) ?? 0,
      children: child.children.map((gc) => ({
        id: gc.id,
        name: gc.name,
        slug: gc.slug,
        slugPath: [top.slug, child.slug, gc.slug],
        level: 2 as const,
        productCount: countByPath.get(`${top.slug}/${child.slug}/${gc.slug}`) ?? 0,
        children: [],
      })),
    })),
  }));
});

export async function getCategoryTotals() {
  const categories = await getAdminCategories();
  const top = categories.length;
  const child = categories.reduce((s, c) => s + c.children.length, 0);
  const grandchild = categories.reduce((s, c) => s + c.children.reduce((s2, cc) => s2 + cc.children.length, 0), 0);
  return { top, child, grandchild, total: top + child + grandchild };
}
