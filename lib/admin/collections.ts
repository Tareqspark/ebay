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
  productCount: number;
}

// Deterministic pseudo-count derived from the catalog so it stays stable
// without wiring each collection to real membership data (no
// collection_products join table exists yet).
function pseudoProductCount(id: string, catalogSize: number): number {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return 20 + (hash % Math.min(400, catalogSize - 20));
}

export const getCollections = cache(async (): Promise<Collection[]> => {
  const [rows, products] = await Promise.all([db.select().from(collectionsTable), getProducts()]);
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    ruleDescription: c.ruleDescription ?? undefined,
    status: c.status,
    updatedAt: c.updatedAt.toISOString(),
    imageSeed: c.imageSeed,
    productCount: pseudoProductCount(c.id, products.length),
  }));
});
