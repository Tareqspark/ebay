import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requirePermission } from "@/lib/admin/permissions";

/**
 * Leaf-category lookup for the product panel's category picker.
 *
 * Searched server-side rather than shipping the list: there are 1,416 leaves,
 * and only a leaf is a valid destination — products carry a three-segment
 * categorySlugPath, so a top or child category would produce a path the
 * storefront can't resolve.
 *
 * Matching runs on the full "Top > Child > Leaf" path, so "kids stacking"
 * finds it as readily as "stacking toys" — an admin recategorising a product
 * usually knows roughly where it belongs, not the exact leaf name.
 */
export interface LeafOption {
  id: string;
  name: string;
  path: string;
  slugPath: [string, string, string];
}

export async function GET(request: NextRequest) {
  const guard = await requirePermission("products");
  if (guard) return NextResponse.json(guard, { status: 403 });

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  // Resolves one product's existing category to a readable path. The product
  // row only carries slugs, and the admin table's `categoryName` is just the
  // top-level one — neither can label "Cameras & Photography > Binoculars &
  // Scopes > Spotting Scopes" on its own.
  const slugPath = (request.nextUrl.searchParams.get("slugPath") ?? "").trim();

  const rows = await db.select().from(categories).orderBy(categories.sortOrder);
  const byId = new Map(rows.map((r) => [r.id, r]));

  const options: LeafOption[] = [];
  for (const row of rows) {
    if (row.level !== "grandchild") continue;
    const child = row.parentId ? byId.get(row.parentId) : undefined;
    const top = child?.parentId ? byId.get(child.parentId) : undefined;
    if (!child || !top) continue;

    const path = `${top.name} > ${child.name} > ${row.name}`;
    const slugs: [string, string, string] = [top.slug, child.slug, row.slug];

    if (slugPath) {
      if (slugs.join("/") !== slugPath) continue;
      return NextResponse.json({ options: [{ id: row.id, name: row.name, path, slugPath: slugs }] });
    }

    // Every whitespace-separated term must appear somewhere in the path, so
    // extra words narrow the list instead of widening it.
    if (q && !q.split(/\s+/).every((term) => path.toLowerCase().includes(term))) continue;

    options.push({ id: row.id, name: row.name, path, slugPath: slugs });
    if (options.length >= 30) break;
  }

  return NextResponse.json({ options });
}
