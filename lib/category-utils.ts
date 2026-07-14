import { CATEGORIES, type Category, type ChildCategory, type GrandchildCategory } from "@/app/data/categories";

export type CategoryLevel = "top" | "child" | "grandchild";

export interface CategoryBreadcrumbItem {
  name: string;
  slug: string;
  href: string;
}

export interface CategorySearchResult {
  id: string;
  name: string;
  href: string;
  level: CategoryLevel;
  breadcrumb: string[];
  topSlug: string;
}

export interface ResolvedCategoryPath {
  top: Category;
  child?: ChildCategory;
  grandchild?: GrandchildCategory;
  breadcrumbs: CategoryBreadcrumbItem[];
}

export function categoryHref(...slugs: string[]): string {
  return `/category/${slugs.join("/")}`;
}

export function getTopCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getChildCategoryBySlug(
  top: Category,
  childSlug: string
): ChildCategory | undefined {
  return top.children.find((c) => c.slug === childSlug);
}

export function getGrandchildCategoryBySlug(
  child: ChildCategory,
  grandchildSlug: string
): GrandchildCategory | undefined {
  return child.children.find((c) => c.slug === grandchildSlug);
}

/**
 * Resolves a slug path like ["electronics", "tv-and-home-theater", "smart-tvs"]
 * against the category tree, returning the matched nodes plus breadcrumbs.
 */
export function resolveCategoryPath(segments: string[]): ResolvedCategoryPath | null {
  const [topSlug, childSlug, grandchildSlug] = segments;
  if (!topSlug) return null;

  const top = getTopCategoryBySlug(topSlug);
  if (!top) return null;

  const breadcrumbs: CategoryBreadcrumbItem[] = [
    { name: "Home", slug: "", href: "/" },
    { name: top.name, slug: top.slug, href: categoryHref(top.slug) },
  ];

  if (!childSlug) {
    return { top, breadcrumbs };
  }

  const child = getChildCategoryBySlug(top, childSlug);
  if (!child) return null;
  breadcrumbs.push({
    name: child.name,
    slug: child.slug,
    href: categoryHref(top.slug, child.slug),
  });

  if (!grandchildSlug) {
    return { top, child, breadcrumbs };
  }

  const grandchild = getGrandchildCategoryBySlug(child, grandchildSlug);
  if (!grandchild) return null;
  breadcrumbs.push({
    name: grandchild.name,
    slug: grandchild.slug,
    href: categoryHref(top.slug, child.slug, grandchild.slug),
  });

  return { top, child, grandchild, breadcrumbs };
}

export function getFeaturedCategories(): Category[] {
  return CATEGORIES.filter((c) => c.featured);
}

interface FlatCategoryEntry {
  id: string;
  name: string;
  level: CategoryLevel;
  href: string;
  breadcrumb: string[];
  topSlug: string;
}

let flatCache: FlatCategoryEntry[] | null = null;

export function flattenCategories(): FlatCategoryEntry[] {
  if (flatCache) return flatCache;

  const flat: FlatCategoryEntry[] = [];
  for (const top of CATEGORIES) {
    flat.push({
      id: top.id,
      name: top.name,
      level: "top",
      href: categoryHref(top.slug),
      breadcrumb: [top.name],
      topSlug: top.slug,
    });
    for (const child of top.children) {
      flat.push({
        id: child.id,
        name: child.name,
        level: "child",
        href: categoryHref(top.slug, child.slug),
        breadcrumb: [top.name, child.name],
        topSlug: top.slug,
      });
      for (const grandchild of child.children) {
        flat.push({
          id: grandchild.id,
          name: grandchild.name,
          level: "grandchild",
          href: categoryHref(top.slug, child.slug, grandchild.slug),
          breadcrumb: [top.name, child.name, grandchild.name],
          topSlug: top.slug,
        });
      }
    }
  }
  flatCache = flat;
  return flat;
}

/**
 * Lightweight ranked search across the entire category tree, used for
 * search-bar autocomplete and "suggested categories" panels.
 */
export function searchCategories(query: string, limit = 8): CategorySearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const scored: { entry: FlatCategoryEntry; score: number }[] = [];

  for (const entry of flattenCategories()) {
    const name = entry.name.toLowerCase();
    let score = -1;
    if (name === trimmed) score = 100;
    else if (name.startsWith(trimmed)) score = 80;
    else if (name.includes(trimmed)) score = 60;
    else if (entry.breadcrumb.some((b) => b.toLowerCase().includes(trimmed))) score = 30;

    if (score > 0) {
      // Prefer more specific (deeper) categories slightly, then shorter names.
      score += entry.level === "grandchild" ? 3 : entry.level === "child" ? 1 : 0;
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.entry.name.length - b.entry.name.length);

  return scored.slice(0, limit).map(({ entry }) => ({
    id: entry.id,
    name: entry.name,
    href: entry.href,
    level: entry.level,
    breadcrumb: entry.breadcrumb,
    topSlug: entry.topSlug,
  }));
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  href: string;
  slugPath: string[];
  children: CategoryTreeNode[];
}

export function buildCategoryTree(): CategoryTreeNode[] {
  return CATEGORIES.map((top) => ({
    id: top.id,
    name: top.name,
    href: categoryHref(top.slug),
    slugPath: [top.slug],
    children: top.children.map((child) => ({
      id: child.id,
      name: child.name,
      href: categoryHref(top.slug, child.slug),
      slugPath: [top.slug, child.slug],
      children: child.children.map((gc) => ({
        id: gc.id,
        name: gc.name,
        href: categoryHref(top.slug, child.slug, gc.slug),
        slugPath: [top.slug, child.slug, gc.slug],
        children: [],
      })),
    })),
  }));
}

export const POPULAR_SEARCHES: string[] = [
  "Wireless Earbuds",
  "4K Smart TVs",
  "Running Shoes",
  "Air Fryers",
  "Gaming Laptops",
  "Robot Vacuums",
  "Coffee Makers",
  "Skincare Sets",
  "Office Chairs",
  "Smartwatches",
];
