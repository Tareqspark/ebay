import { cache } from "react";
import { getFeaturedDealProducts, getWeeklyTopDealProducts } from "@/lib/products";

export interface HomepageDealProduct {
  id: string;
  title: string;
  image: string;
  price: number;
}

export interface HomepageDealsSelection {
  featuredDeals: HomepageDealProduct[];
  weeklyTopDeals: HomepageDealProduct[];
}

function toPickerProduct(p: { id: string; title: string; images: string[]; price: number }): HomepageDealProduct {
  return { id: p.id, title: p.title, image: p.images[0], price: p.price };
}

/** Current admin-curated selections for the homepage's "Featured Deals" and "This Week's Top Deals" rails — see lib/admin/homepage-deals-actions.ts for how they're set. */
export const getHomepageDealsSelection = cache(async (): Promise<HomepageDealsSelection> => {
  const [featuredDeals, weeklyTopDeals] = await Promise.all([
    getFeaturedDealProducts(50),
    getWeeklyTopDealProducts(50),
  ]);
  return { featuredDeals: featuredDeals.map(toPickerProduct), weeklyTopDeals: weeklyTopDeals.map(toPickerProduct) };
});
