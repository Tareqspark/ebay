import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";
import { getBrandById } from "@/app/data/brands";
import { RatingStars } from "@/components/product/rating-stars";
import { PriceDisplay } from "@/components/product/price-display";
import { ProductBadges } from "@/components/product/product-badges";
import { WishlistButton } from "@/components/product/wishlist-button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const brand = getBrandById(product.brandId);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        <ProductBadges product={product} className="absolute left-2 top-2" />
        <WishlistButton className="absolute right-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {brand && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {brand.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.title}</h3>
        <RatingStars rating={product.review.rating} count={product.review.count} />
        <div className="mt-auto pt-1">
          <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="sm" />
          {product.freeShipping && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5" />
              Free shipping
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
