import "server-only";
import { cache } from "react";
import { db } from "@/db";
import { brands as brandsTable } from "@/db/schema";
import type { Brand } from "@/lib/types";

export const getAllBrands = cache(async (): Promise<Brand[]> => {
  const rows = await db.select().from(brandsTable);
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, categorySlugs: r.categorySlugs }));
});

export async function getBrandById(id: string): Promise<Brand | undefined> {
  const all = await getAllBrands();
  return all.find((b) => b.id === id);
}

export async function getBrandsForCategory(categorySlug: string, limit = 12): Promise<Brand[]> {
  const all = await getAllBrands();
  return all.filter((b) => b.categorySlugs.includes(categorySlug)).slice(0, limit);
}
