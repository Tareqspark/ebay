import "server-only";
import { cache } from "react";
import type { ReactNode } from "react";
import { asc } from "drizzle-orm";
import Fuse from "fuse.js";
import { db } from "@/db";
import { categories as categoriesTable } from "@/db/schema";
import { resolveCategoryIcon } from "@/lib/category-icons";
import type { LucideIcon } from "lucide-react";
import { categoryHref, POPULAR_SEARCHES } from "@/lib/category-client";

export { categoryHref, POPULAR_SEARCHES };

export type CategoryLevel = "top" | "child" | "grandchild";

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

/** Same shape as Category, minus the non-serializable icon component — safe to pass as a prop into a "use client" component. See CLAUDE.md's RSC icon gotcha. */
export interface ClientCategory {
  id: string;
  name: string;
  slug: string;
  iconNode: ReactNode;
  image: string;
  description: string;
  featured: boolean;
  children: ChildCategory[];
}

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

/**
 * Fetches and assembles the full 3-level category tree from the database,
 * once per request (React cache() dedupes repeated calls within a single
 * render pass — every page below calls this at least once).
 */
export const getCategoryTree = cache(async (): Promise<Category[]> => {
  const rows = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder));

  const grandchildrenByParent = new Map<string, GrandchildCategory[]>();
  const childrenByParent = new Map<string, ChildCategory[]>();
  const tops: Category[] = [];

  for (const row of rows) {
    if (row.level === "grandchild") {
      const list = grandchildrenByParent.get(row.parentId!) ?? [];
      list.push({ id: row.id, name: row.name, slug: row.slug });
      grandchildrenByParent.set(row.parentId!, list);
    }
  }
  for (const row of rows) {
    if (row.level === "child") {
      const list = childrenByParent.get(row.parentId!) ?? [];
      list.push({ id: row.id, name: row.name, slug: row.slug, children: grandchildrenByParent.get(row.id) ?? [] });
      childrenByParent.set(row.parentId!, list);
    }
  }
  for (const row of rows) {
    if (row.level === "top") {
      tops.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        icon: resolveCategoryIcon(row.iconName),
        image: row.image ?? "",
        description: row.description ?? "",
        featured: row.featured ?? false,
        children: childrenByParent.get(row.id) ?? [],
      });
    }
  }
  return tops;
});

/** Strips the non-serializable `icon` field, replacing it with a pre-rendered node — pass this (not `Category`) into client components. */
export function toClientCategories(cats: Category[], iconClassName = "h-4 w-4 shrink-0"): ClientCategory[] {
  return cats.map(({ icon: Icon, ...rest }) => ({
    ...rest,
    iconNode: <Icon className={iconClassName} />,
  }));
}

export async function getTopCategoryBySlug(slug: string): Promise<Category | undefined> {
  const tree = await getCategoryTree();
  return tree.find((c) => c.slug === slug);
}

export function getChildCategoryBySlug(top: Category, childSlug: string): ChildCategory | undefined {
  return top.children.find((c) => c.slug === childSlug);
}

export function getGrandchildCategoryBySlug(child: ChildCategory, grandchildSlug: string): GrandchildCategory | undefined {
  return child.children.find((c) => c.slug === grandchildSlug);
}

/**
 * Resolves a slug path like ["electronics", "tv-and-home-theater", "smart-tvs"]
 * against the category tree, returning the matched nodes plus breadcrumbs.
 */
export async function resolveCategoryPath(segments: string[]): Promise<ResolvedCategoryPath | null> {
  const [topSlug, childSlug, grandchildSlug] = segments;
  if (!topSlug) return null;

  const top = await getTopCategoryBySlug(topSlug);
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
  breadcrumbs.push({ name: child.name, slug: child.slug, href: categoryHref(top.slug, child.slug) });

  if (!grandchildSlug) {
    return { top, child, breadcrumbs };
  }

  const grandchild = getGrandchildCategoryBySlug(child, grandchildSlug);
  if (!grandchild) return null;
  breadcrumbs.push({ name: grandchild.name, slug: grandchild.slug, href: categoryHref(top.slug, child.slug, grandchild.slug) });

  return { top, child, grandchild, breadcrumbs };
}

export async function getFeaturedCategories(): Promise<Category[]> {
  const tree = await getCategoryTree();
  return tree.filter((c) => c.featured);
}

interface FlatCategoryEntry {
  id: string;
  name: string;
  level: CategoryLevel;
  href: string;
  breadcrumb: string[];
  topSlug: string;
}

export async function flattenCategories(): Promise<FlatCategoryEntry[]> {
  const tree = await getCategoryTree();
  const flat: FlatCategoryEntry[] = [];
  for (const top of tree) {
    flat.push({ id: top.id, name: top.name, level: "top", href: categoryHref(top.slug), breadcrumb: [top.name], topSlug: top.slug });
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
  return flat;
}

/**
 * Name-only index (fresh per request — categories are admin-editable now;
 * 1,652 nodes is cheap to index on every call). Deliberately NOT a
 * multi-key index over name+breadcrumb: every descendant of, say,
 * "Electronics" carries "Electronics" in its own breadcrumb, so a
 * combined weighted score lets a category's own hundred-plus descendants
 * collectively outscore the category itself for its own (mistyped) name —
 * verified live where a search for "Electornics" dropped the actual
 * "Electronics" node out of the top 15 entirely. Keeping name and
 * breadcrumb as two separate, tiered passes (below) avoids that.
 */
const getCategoryNameIndex = cache(async (): Promise<Fuse<FlatCategoryEntry>> => {
  const entries = await flattenCategories();
  return new Fuse(entries, { keys: ["name"], threshold: 0.35, ignoreLocation: true, minMatchCharLength: 2, includeScore: true });
});

const levelRank = (level: CategoryLevel) => (level === "grandchild" ? 0 : level === "child" ? 1 : 2);

/**
 * Typo-tolerant ranked search across the entire category tree, used for
 * search-bar autocomplete and "suggested categories" panels. Server-only —
 * client components reach this through /api/categories/search. Two tiers,
 * matching the pre-Fuse design: a name match always outranks a
 * breadcrumb-only match (e.g. "shoes" surfacing "Athletic Shoes" by name
 * before it surfaces every other category that merely lives under
 * "Footwear"), and within a tier, a grandchild — the level products
 * actually attach to — wins ties over a same-relevance parent category.
 */
export async function searchCategories(query: string, limit = 8): Promise<CategorySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const nameIndex = await getCategoryNameIndex();
  const nameMatches = nameIndex.search(trimmed, { limit: limit * 3 });
  // Bucket scores into 0.05-wide steps before comparing — sorting by "close
  // enough" score with a plain epsilon isn't a transitive relation (A≈B and
  // B≈C doesn't imply A≈C), which silently corrupts Array.sort on anything
  // past a handful of items. Rounding first makes equality a real
  // equivalence class, so the level tiebreak only ever applies within a
  // bucket, never smears across the whole result set.
  nameMatches.sort((a, b) => {
    const bucketA = Math.round((a.score ?? 0) * 20);
    const bucketB = Math.round((b.score ?? 0) * 20);
    if (bucketA !== bucketB) return bucketA - bucketB;
    return levelRank(a.item.level) - levelRank(b.item.level);
  });

  const matched: FlatCategoryEntry[] = nameMatches.map((r) => r.item);

  if (matched.length < limit) {
    const matchedIds = new Set(matched.map((e) => e.id));
    const needle = trimmed.toLowerCase();
    const breadcrumbMatches = (await flattenCategories())
      .filter((e) => !matchedIds.has(e.id) && e.breadcrumb.some((b) => b.toLowerCase().includes(needle)))
      .sort((a, b) => levelRank(a.level) - levelRank(b.level));
    matched.push(...breadcrumbMatches);
  }

  return matched.slice(0, limit).map((entry) => ({
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

/** Icon-free tree shape (id/name/href/children only) — safe to pass to client components directly, no toClientCategories() needed. */
export async function buildCategoryTree(): Promise<CategoryTreeNode[]> {
  const tree = await getCategoryTree();
  return tree.map((top) => ({
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

