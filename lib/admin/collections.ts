import { cache } from "react";
import { db } from "@/db";
import { collections as collectionsTable } from "@/db/schema";
import { getProducts } from "@/lib/admin/data";

export type CollectionType = "manual" | "automated";
export type CollectionStatus = "active" | "draft";

export interface Collection {
  id: string;
  name: string;
  type: CollectionType;
  ruleDescription?: string;
  status: CollectionStatus;
  updatedAt: string;
  imageSeed: string;
}

export const getCollections = cache(async (): Promise<Collection[]> => {
  const rows = await db.select().from(collectionsTable);
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    ruleDescription: c.ruleDescription ?? undefined,
    status: c.status,
    updatedAt: c.updatedAt.toISOString(),
    imageSeed: c.imageSeed,
  }));
});

export async function getCollectionProductCount(collection: Collection): Promise<number> {
  // Deterministic pseudo-count derived from the catalog so it stays stable
  // without wiring each collection to real membership data.
  const products = await getProducts();
  let hash = 0;
  for (const ch of collection.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return 20 + (hash % Math.min(400, products.length - 20));
}
