"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { ProductRail } from "@/components/product/product-rail";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import type { Product } from "@/lib/types";

export function RecentlyViewedSection() {
  const { ids, hydrated } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!hydrated || ids.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data: { products: Product[] }) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, ids]);

  if (!hydrated || products.length === 0) return null;

  return <ProductRail title="Recently Viewed" icon={<History className="h-5 w-5" />} products={products} />;
}
