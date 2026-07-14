import { Award, Sparkles, Tag, TrendingUp, Wand2 } from "lucide-react";
import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedCategoriesGrid } from "@/components/home/featured-categories-grid";
import { FlashSaleSection } from "@/components/home/flash-sale-section";
import { RecentlyViewedSection } from "@/components/home/recently-viewed-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ProductRail } from "@/components/product/product-rail";
import { getFeaturedCategories } from "@/lib/category-utils";
import {
  getBestSellerProducts,
  getDealsProducts,
  getFlashSaleProducts,
  getNewArrivalProducts,
  getRecommendedProducts,
  getTrendingProducts,
} from "@/lib/products";

export default function HomePage() {
  const featuredCategories = getFeaturedCategories();
  const heroSlides = featuredCategories.slice(0, 5).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    description: c.description,
  }));
  const deals = getDealsProducts(14);
  const flashSale = getFlashSaleProducts(14);
  const trending = getTrendingProducts(14);
  const newArrivals = getNewArrivalProducts(14);
  const bestSellers = getBestSellerProducts(14);
  const recommended = getRecommendedProducts(14);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 py-6 sm:px-6 sm:py-8">
      <HeroBanner slides={heroSlides} />

      <FeaturedCategoriesGrid categories={featuredCategories} />

      <div id="deals">
        <ProductRail
          title="Today's Deals"
          subtitle="Limited-time savings across the store"
          icon={<Tag className="h-5 w-5" />}
          products={deals}
          viewAllHref="/category/electronics"
        />
      </div>

      <FlashSaleSection products={flashSale} />

      <ProductRail
        title="Trending Now"
        subtitle="What everyone's adding to their cart"
        icon={<TrendingUp className="h-5 w-5" />}
        products={trending}
      />

      <ProductRail
        title="New Arrivals"
        subtitle="Fresh finds, just landed"
        icon={<Sparkles className="h-5 w-5" />}
        products={newArrivals}
      />

      <ProductRail
        title="Best Sellers"
        subtitle="Customer favorites, tried and true"
        icon={<Award className="h-5 w-5" />}
        products={bestSellers}
      />

      <RecentlyViewedSection />

      <ProductRail
        title="Recommended For You"
        subtitle="Picked based on top-rated products"
        icon={<Wand2 className="h-5 w-5" />}
        products={recommended}
      />

      <NewsletterSection />
    </div>
  );
}
