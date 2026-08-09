"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/use-wishlist";

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const { isInWishlist, toggle } = useWishlist();
  const saved = isInWishlist(productId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border backdrop-blur transition hover:scale-105 hover:bg-background",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          saved ? "fill-error text-error" : "text-muted-foreground"
        )}
      />
    </button>
  );
}
