"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function WishlistButton({ className }: { className?: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((s) => !s);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border backdrop-blur transition hover:scale-105 hover:bg-background",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
        )}
      />
    </button>
  );
}
