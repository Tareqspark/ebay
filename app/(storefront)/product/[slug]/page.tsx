import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ShieldCheck, Truck } from "lucide-react";
import { CategoryBreadcrumb } from "@/components/category/category-breadcrumb";
import { ProductGallery } from "@/components/product/product-gallery";
import { RatingStars } from "@/components/product/rating-stars";
import { PriceDisplay } from "@/components/product/price-display";
import { ProductBadges } from "@/components/product/product-badges";
import { AddToCart } from "@/components/product/add-to-cart";
import { RecordRecentlyViewed } from "@/components/product/record-recently-viewed";
import { ProductRail } from "@/components/product/product-rail";
import { ReviewsSection } from "@/components/product/reviews-section";
import { auth } from "@/auth";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { resolveCategoryPath } from "@/lib/category-utils";
import { recordProductView } from "@/lib/product-views";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();
  const [resolved, related] = await Promise.all([
    resolveCategoryPath(product.categorySlugPath),
    getRelatedProducts(product, 12),
  ]);
  if (session?.user?.id) {
    await recordProductView(session.user.id, product.id, product.categorySlugPath[0]);
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8">
      <RecordRecentlyViewed productId={product.id} />

      {resolved && <CategoryBreadcrumb items={[...resolved.breadcrumbs, { name: product.title, slug: product.slug, href: "" }]} />}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[480px_1fr]">
        <ProductGallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.brandName ?? product.brandId}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{product.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <RatingStars rating={product.review.rating} count={product.review.count} size="md" />
            </div>
          </div>

          <ProductBadges product={product} />

          <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="lg" />

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <Truck className="h-4 w-4 text-primary" />
              {product.freeShipping ? "Free shipping on this item" : "Standard shipping rates apply"}
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              1-year limited warranty included
            </span>
            <span className="flex items-center gap-2 text-foreground">
              {product.stock > 0 ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  In stock — {product.stock} available
                </>
              ) : (
                "Currently out of stock"
              )}
            </span>
          </div>

          <AddToCart productId={product.id} inStock={product.stock > 0} />

          {product.features.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">Highlights</h2>
              <ul className="flex flex-col gap-1.5">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ReviewsSection productId={product.id} productSlug={product.slug} />

      <ProductRail title="You Might Also Like" products={related} />
    </div>
  );
}
