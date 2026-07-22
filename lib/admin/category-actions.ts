"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt, lt, asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { newId } from "@/lib/id";
import { slugify } from "@/lib/slugify";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { getProducts } from "@/lib/admin/data";
import type { CategoryLevel } from "@/lib/admin/categories";

export interface CategoryActionResult {
  error?: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
  iconName: string;
  image: string;
  description: string;
  featured: boolean;
}

function revalidateCategoryViews() {
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

async function slugTaken(slug: string, parentId: string | null, excludeId?: string): Promise<boolean> {
  const siblings = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(parentId ? eq(categories.parentId, parentId) : eq(categories.level, "top"));
  return siblings.some((s) => s.slug === slug && s.id !== excludeId);
}

export async function createCategoryAction(
  parentId: string | null,
  level: CategoryLevel,
  input: CategoryInput
): Promise<CategoryActionResult> {
  const name = input.name.trim();
  if (!name) return { error: "Name is required" };
  const slug = slugify(input.slug.trim() || name);
  if (!slug) return { error: "A valid slug is required" };
  if (await slugTaken(slug, parentId)) return { error: "A category with this slug already exists at this level" };

  const siblingSort = await db
    .select({ sortOrder: categories.sortOrder })
    .from(categories)
    .where(parentId ? eq(categories.parentId, parentId) : eq(categories.level, "top"))
    .orderBy(desc(categories.sortOrder))
    .limit(1);
  const maxSort = siblingSort[0]?.sortOrder ?? -1;

  await db.insert(categories).values({
    id: newId(),
    parentId,
    level,
    name,
    slug,
    iconName: level === "top" ? input.iconName || null : null,
    image: level === "top" ? input.image.trim() || null : null,
    description: level === "top" ? input.description.trim() || null : null,
    featured: level === "top" ? input.featured : false,
    sortOrder: maxSort + 1,
  });

  const actor = await getAdminActorName();
  await logActivity("product", `Category "${name}" created`, actor);
  revalidateCategoryViews();
  return {};
}

export async function updateCategoryAction(id: string, input: CategoryInput): Promise<CategoryActionResult> {
  const name = input.name.trim();
  if (!name) return { error: "Name is required" };
  const slug = slugify(input.slug.trim() || name);
  if (!slug) return { error: "A valid slug is required" };

  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) return { error: "Category not found" };
  if (await slugTaken(slug, existing.parentId, id)) return { error: "A category with this slug already exists at this level" };

  await db
    .update(categories)
    .set({
      name,
      slug,
      iconName: existing.level === "top" ? input.iconName || null : existing.iconName,
      image: existing.level === "top" ? input.image.trim() || null : existing.image,
      description: existing.level === "top" ? input.description.trim() || null : existing.description,
      featured: existing.level === "top" ? input.featured : false,
    })
    .where(eq(categories.id, id));

  const actor = await getAdminActorName();
  await logActivity("product", `Category "${name}" updated`, actor);
  revalidateCategoryViews();
  return {};
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) return { error: "Category not found" };

  const [child] = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, id)).limit(1);
  if (child) return { error: "Delete or move its subcategories first" };

  const products = await getProducts();
  const slugPath = await buildSlugPath(existing);
  const hasProducts = products.some((p) => {
    const path = p.categorySlugPath.slice(0, slugPath.length).join("/");
    return path === slugPath.join("/");
  });
  if (hasProducts) return { error: "This category still has products in it — move or remove them first" };

  await db.delete(categories).where(eq(categories.id, id));

  const actor = await getAdminActorName();
  await logActivity("product", `Category "${existing.name}" deleted`, actor);
  revalidateCategoryViews();
  return {};
}

async function buildSlugPath(row: typeof categories.$inferSelect): Promise<string[]> {
  const path = [row.slug];
  let parentId = row.parentId;
  while (parentId) {
    const [parent] = await db.select().from(categories).where(eq(categories.id, parentId)).limit(1);
    if (!parent) break;
    path.unshift(parent.slug);
    parentId = parent.parentId;
  }
  return path;
}

export async function moveCategoryAction(id: string, direction: "up" | "down"): Promise<CategoryActionResult> {
  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) return { error: "Category not found" };

  const scope = existing.parentId
    ? and(eq(categories.parentId, existing.parentId), direction === "up" ? lt(categories.sortOrder, existing.sortOrder) : gt(categories.sortOrder, existing.sortOrder))
    : and(eq(categories.level, "top"), direction === "up" ? lt(categories.sortOrder, existing.sortOrder) : gt(categories.sortOrder, existing.sortOrder));

  const [neighbor] = await db
    .select()
    .from(categories)
    .where(scope)
    .orderBy(direction === "up" ? desc(categories.sortOrder) : asc(categories.sortOrder))
    .limit(1);
  if (!neighbor) return {};

  await db.update(categories).set({ sortOrder: neighbor.sortOrder }).where(eq(categories.id, existing.id));
  await db.update(categories).set({ sortOrder: existing.sortOrder }).where(eq(categories.id, neighbor.id));

  revalidateCategoryViews();
  return {};
}
