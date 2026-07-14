"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductRailProps {
  title: string;
  subtitle?: string;
  /** Pass a pre-rendered icon element, e.g. `<Tag className="h-5 w-5" />` — not a component reference. */
  icon?: ReactNode;
  products: Product[];
  viewAllHref?: string;
  accent?: "default" | "flash";
  className?: string;
  hideHeader?: boolean;
}

export function ProductRail({
  title,
  subtitle,
  icon,
  products,
  viewAllHref,
  accent = "default",
  className,
  hideHeader = false,
}: ProductRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className={cn("relative", className)}>
      {!hideHeader && (
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                accent === "flash" ? "bg-red-600 text-white" : "bg-primary/10 text-primary"
              )}
            >
              {icon}
            </span>
          )}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Button
              variant="link"
              className="hidden px-0 sm:inline-flex"
              nativeButton={false}
              render={<Link href={viewAllHref}>View all</Link>}
            />
          )}
          <div className="hidden gap-1 sm:flex">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      )}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={i < 4}
            className="w-[168px] shrink-0 snap-start sm:w-[200px]"
          />
        ))}
      </div>
    </section>
  );
}
