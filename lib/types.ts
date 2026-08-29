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
  isFeaturedDeal: boolean;
  isWeeklyTopDeal: boolean;
  flashSaleEndsAt?: string;
  freeShipping: boolean;
  stock: number;
  description: string;
  features: string[];
  /**
   * Variants.
   *
   * Every product belongs to a group, usually of one. Where a group has
   * siblings, listings show a single card for the whole group and the product
   * page offers a selector; these fields carry what the card needs to say so
   * it does not have to fetch the siblings to render.
   */
  variantGroupId?: string;
  /** What the selector shows for this row — "Red", "Blue-XL". Null when the group has one member. */
  variantLabel?: string;
  /** Structured attributes, {"colour":"Red","size":"S"} — populated by import, absent on older rows. */
  variantOptions?: Record<string, string>;
  /** How many buyable variants the group has, including this one. */
  variantCount?: number;
  /** Cheapest and dearest in the group, so a card can say "from $12.99". */
  priceFrom?: number;
  priceTo?: number;
}
