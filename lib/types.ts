export interface Brand {
  id: string;
  name: string;
  slug: string;
  categorySlugs: string[];
}

export interface ProductReview {
  rating: number;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brandId: string;
  /** Denormalized at the query layer (lib/products.ts) so client components
   * (ProductCard, rendered inside client-side ProductRail/ProductExplorer)
   * never need to fetch brand data themselves — see CLAUDE.md. Optional
   * because the legacy generated app/data/products.ts array (being phased
   * out as consumers move to the DB-backed lib/products.ts) predates this
   * field; every DB-backed fetch function always populates it. */
  brandName?: string;
  price: number;
  originalPrice?: number;
  currency: "USD";
  images: string[];
  review: ProductReview;
  categorySlugPath: string[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
  isDeal: boolean;
  flashSaleEndsAt?: string;
  freeShipping: boolean;
  stock: number;
  description: string;
  features: string[];
}
