import { cache } from "react";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { collections as collectionsTable, collectionItems as collectionItemsTable } from "@/db/schema";
import { getProductsByIds, countProductsMatchingRule } from "@/lib/products";

export type CollectionType = "manual" | "automated";
export type CollectionStatus = "active" | "draft";

export interface CollectionRuleInput {
  topCategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  bundledOnly?: boolean;
}

export interface CollectionPickerProduct {
  id: string;
  title: string;
  image: string;
  price: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string | null;
  type: CollectionType;
  ruleDescription?: string;
  rule: CollectionRuleInput;
  status: CollectionStatus;
  updatedAt: string;
  imageSeed: string;
  productCount: number;
  /** Eagerly loaded so the edit dialog's ProductPicker has an initial selection without a round trip — empty for automated collections, which have no stored membership. */
  products: CollectionPickerProduct[];
}

export const getCollections = cache(async (): Promise<Collection[]> => {
  const rows = await db.select().from(collectionsTable);
  const manualRows = rows.filter((c) => c.type === "manual");

  const productIdsByCollection = new Map<string, string[]>();
  if (manualRows.length > 0) {
    const items = await db
      .select()
      .from(collectionItemsTable)
      .where(inArray(collectionItemsTable.collectionId, manualRows.map((c) => c.id)));
    for (const item of items) {
      const list = productIdsByCollection.get(item.collectionId) ?? [];
      list.push(item.productId);
      productIdsByCollection.set(item.collectionId, list);
    }
  }

  const allProductIds = [...new Set([...productIdsByCollection.values()].flat())];
  const products = await getProductsByIds(allProductIds);
  const productById = new Map(products.map((p) => [p.id, p]));

  return Promise.all(
    rows.map(async (c) => {
      const memberIds = productIdsByCollection.get(c.id) ?? [];
      const memberProducts = memberIds
        .map((id) => productById.get(id))
        .filter((p): p is NonNullable<typeof p> => !!p)
        .map((p) => ({ id: p.id, title: p.title, image: p.images[0], price: p.price }));

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        type: c.type,
        ruleDescription: c.ruleDescription ?? undefined,
        rule: {
          topCategorySlug: c.ruleTopCategorySlug ?? undefined,
          minPrice: c.ruleMinPriceCents != null ? c.ruleMinPriceCents / 100 : undefined,
          maxPrice: c.ruleMaxPriceCents != null ? c.ruleMaxPriceCents / 100 : undefined,
          minRating: c.ruleMinRating != null ? Number(c.ruleMinRating) : undefined,
          bundledOnly: c.ruleBundledOnly || undefined,
        },
        status: c.status,
        updatedAt: c.updatedAt.toISOString(),
        imageSeed: c.imageSeed,
        productCount:
          c.type === "manual"
            ? memberProducts.length
            : await countProductsMatchingRule({
                topCategorySlug: c.ruleTopCategorySlug,
                minPriceCents: c.ruleMinPriceCents,
                maxPriceCents: c.ruleMaxPriceCents,
                minRating: c.ruleMinRating,
                bundledOnly: c.ruleBundledOnly,
              }),
        products: memberProducts,
      };
    })
  );
});
