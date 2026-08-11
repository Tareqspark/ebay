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
import { checkPlainText, checkSafeUrl } from "@/lib/sanitize";
import { requirePermission } from "@/lib/admin/permissions";
import { deleteUploadedImage, isManagedUpload } from "@/lib/uploads";
import { IMAGE_HOSTS, isAllowedImageHost } from "@/lib/image-hosts";
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

/**
 * Blank is allowed (no image), but anything present has to be a real image
 * location. checkSafeUrl rather than checkPlainText: `javascript:...` gets
 * past a `<`/`>` check, and this value is written straight into an `src`.
 *
 * Remote URLs are additionally held to the next/image host allowlist. Without
 * that check a pasted URL from any other host is accepted here and then
 * *throws during render*, breaking every page that shows the category —
 * the admin categories screen included, leaving no way to undo it in the UI.
 */
function checkImage(value: string): string | null {
  const url = value.trim();
  if (!url) return null;

  const unsafe = checkSafeUrl(url, "Image URL");
  if (unsafe) return unsafe;
  if (url.startsWith("/")) return null;

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return "Image URL isn't a valid address";
  }
  if (!isAllowedImageHost(hostname)) {
    return `Images can't be loaded from ${hostname} — upload the file instead, or use one of: ${IMAGE_HOSTS.join(", ")}`;
  }
  return null;
}

/**
 * Replaced images are removed from disk so the uploads directory doesn't
 * grow by a file per edit. Guarded by isManagedUpload: a category still
 * pointing at picsum.photos or a CDN must never produce an unlink.
 */
async function discardReplacedImage(previous: string | null, next: string | null) {
  if (!previous || previous === next) return;
  if (isManagedUpload(previous)) await deleteUploadedImage(previous);
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
  const guard = await requirePermission("categories");
  if (guard) return guard;

  const name = input.name.trim();
  if (!name) return { error: "Name is required" };
  const nameError = checkPlainText(name, "Name") ?? checkPlainText(input.description, "Description") ?? checkImage(input.image);
  if (nameError) return { error: nameError };
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
    // Every level carries an image: child and grandchild tiles render one
    // too (components/category/subcategory-grid.tsx), and only the icon,
    // description and featured flag are genuinely top-level concerns.
    image: input.image.trim() || null,
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
  const guard = await requirePermission("categories");
  if (guard) return guard;

  const name = input.name.trim();
  if (!name) return { error: "Name is required" };
  const nameError = checkPlainText(name, "Name") ?? checkPlainText(input.description, "Description") ?? checkImage(input.image);
  if (nameError) return { error: nameError };
  const slug = slugify(input.slug.trim() || name);
  if (!slug) return { error: "A valid slug is required" };

  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) return { error: "Category not found" };
  if (await slugTaken(slug, existing.parentId, id)) return { error: "A category with this slug already exists at this level" };

  const image = input.image.trim() || null;
  await db
    .update(categories)
    .set({
      name,
      slug,
      iconName: existing.level === "top" ? input.iconName || null : existing.iconName,
      image,
      description: existing.level === "top" ? input.description.trim() || null : existing.description,
      featured: existing.level === "top" ? input.featured : false,
    })
    .where(eq(categories.id, id));
  await discardReplacedImage(existing.image, image);

  const actor = await getAdminActorName();
  await logActivity("product", `Category "${name}" updated`, actor);
  revalidateCategoryViews();
  return {};
}

/**
 * Sets or clears one category's image on its own, without going through the
 * whole edit form — what the tree view's inline picker calls. Kept separate
 * from updateCategoryAction so assigning artwork to hundreds of categories
 * never risks rewriting a name or slug as a side effect.
 */
export async function setCategoryImageAction(id: string, url: string | null): Promise<CategoryActionResult> {
  const guard = await requirePermission("categories");
  if (guard) return guard;

  const image = url?.trim() || null;
  if (image) {
    const urlError = checkImage(image);
    if (urlError) return { error: urlError };
  }

  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) return { error: "Category not found" };
  if (existing.image === image) return {};

  await db.update(categories).set({ image }).where(eq(categories.id, id));
  await discardReplacedImage(existing.image, image);

  const actor = await getAdminActorName();
  await logActivity("product", `Category "${existing.name}" image ${image ? "updated" : "removed"}`, actor);
  revalidateCategoryViews();
  return {};
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const guard = await requirePermission("categories");
  if (guard) return guard;

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
  await discardReplacedImage(existing.image, null);

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
  const guard = await requirePermission("categories");
  if (guard) return guard;

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
