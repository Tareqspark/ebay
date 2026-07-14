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
