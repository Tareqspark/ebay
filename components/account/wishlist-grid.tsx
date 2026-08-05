"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { useWishlist } from "@/hooks/use-wishlist";
import type { Product } from "@/lib/types";

export function WishlistGrid() {
  const { ids, hydrated } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data: { products: Product[] }) => {
        if (!cancelled) setProducts(data.products);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, ids]);

  if (!hydrated || loading) return null;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
        <Heart className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Nothing saved yet — tap the heart on any product to add it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
