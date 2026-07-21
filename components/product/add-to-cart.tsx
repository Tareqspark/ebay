"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";

export function AddToCart({ productId, inStock }: { productId: string; inStock: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, isPending } = useCart();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex h-11 items-center rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-medium tabular-nums">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
          className="flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          disabled={quantity >= 10}
          aria-label="Increase quantity"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <Button
        size="lg"
        disabled={!inStock || isPending}
        onClick={() => {
          addItem(productId, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
        className="h-11 flex-1 gap-2"
      >
        {added ? (
          <>
            <Check className="h-4.5 w-4.5" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingBag className="h-4.5 w-4.5" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </>
        )}
      </Button>
    </div>
  );
}
