"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/format";

export interface BundlePromoProduct {
  id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
}

interface BundlePromoProps {
  bundleName: string;
  products: BundlePromoProduct[];
  bundlePrice: number;
  regularPrice: number;
}

export function BundlePromo({ bundleName, products, bundlePrice, regularPrice }: BundlePromoProps) {
  const { addBundle, isPending } = useCart();
  const savings = Math.round((regularPrice - bundlePrice) * 100) / 100;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Gift className="h-4 w-4 text-primary" />
        Buy it with — {bundleName}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
            title={product.title}
          >
            <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">{formatPrice(bundlePrice)}</span>
        <span className="text-muted-foreground line-through">{formatPrice(regularPrice)}</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">Save {formatPrice(savings)}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => addBundle(products.map((p) => p.id))}
      >
        Add bundle to cart
      </Button>
    </div>
  );
}
