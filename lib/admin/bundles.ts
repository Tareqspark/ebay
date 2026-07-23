import { cache } from "react";
import { getBundles as getBundlesRaw } from "@/lib/bundles";
import { getProductsByIds } from "@/lib/products";
import type { Bundle, BundleDiscountType, BundleStatus } from "@/lib/bundles";

export type { BundleDiscountType, BundleStatus };

export interface AdminBundleProduct {
  id: string;
  title: string;
  image: string;
  price: number;
}

export interface AdminBundle extends Omit<Bundle, "productIds"> {
  products: AdminBundleProduct[];
}

export const getAdminBundles = cache(async (): Promise<AdminBundle[]> => {
  const bundles = await getBundlesRaw();
  const allProductIds = [...new Set(bundles.flatMap((b) => b.productIds))];
  const products = await getProductsByIds(allProductIds);
  const productById = new Map(products.map((p) => [p.id, p]));

  return bundles.map((b) => ({
    ...b,
    products: b.productIds
      .map((id) => productById.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({ id: p.id, title: p.title, image: p.images[0], price: p.price })),
  }));
});
