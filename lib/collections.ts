import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { collections as collectionsTable, collectionItems as collectionItemsTable } from "@/db/schema";
import { getProductsByIds, getProductsMatchingRule } from "@/lib/products";
import type { Product } from "@/lib/types";

export interface StorefrontCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageSeed: string;
}

type CollectionRow = typeof collectionsTable.$inferSelect;

function toStorefrontCollection(row: CollectionRow): StorefrontCollection | null {
  // A row with no slug predates the column and hasn't been backfilled —
  // treat it as not yet publishable rather than link to a broken URL.
  if (!row.slug) return null;
  return { id: row.id, name: row.name, slug: row.slug, description: row.ruleDescription ?? undefined, imageSeed: row.imageSeed };
}

/** Active collections for storefront discovery surfaces (e.g. the homepage's "Shop by Collection" rail). */
export async function getActiveCollections(): Promise<StorefrontCollection[]> {
  const rows = await db.select().from(collectionsTable).where(eq(collectionsTable.status, "active"));
  return rows.map(toStorefrontCollection).filter((c): c is StorefrontCollection => c !== null);
}

export async function getCollectionBySlug(slug: string): Promise<StorefrontCollection | null> {
  const [row] = await db.select().from(collectionsTable).where(eq(collectionsTable.slug, slug)).limit(1);
  if (!row || row.status !== "active") return null;
  return toStorefrontCollection(row);
}

/**
 * Manual collections list their explicit collection_items membership;
 * automated collections have none stored — membership is computed live
 * from the rule columns (see getProductsMatchingRule) every time this is
 * called, so the set can grow or shrink as the catalog changes.
 */
export async function getCollectionProducts(collectionId: string, limit = 60): Promise<Product[]> {
  const [row] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, collectionId)).limit(1);
  if (!row) return [];

  if (row.type === "manual") {
    const items = await db
      .select({ productId: collectionItemsTable.productId })
      .from(collectionItemsTable)
      .where(eq(collectionItemsTable.collectionId, collectionId));
    const products = await getProductsByIds(items.map((i) => i.productId));
    return products.slice(0, limit);
  }

  return getProductsMatchingRule(
    {
      topCategorySlug: row.ruleTopCategorySlug,
      minPriceCents: row.ruleMinPriceCents,
      maxPriceCents: row.ruleMaxPriceCents,
      minRating: row.ruleMinRating,
    },
    limit
  );
}
