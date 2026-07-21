"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { cart, isPending, updateQuantity, removeItem } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
        <Button render={<Link href="/" />} nativeButton={false} size="sm">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
        {cart.items.map((line) => (
          <div key={line.itemId} className="flex items-center gap-4 p-4">
            <Link href={`/product/${line.product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              <Image src={line.product.images[0]} alt="" fill sizes="80px" className="object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/product/${line.product.slug}`} className="line-clamp-2 text-sm font-medium text-foreground hover:underline">
                {line.product.title}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{formatPrice(line.product.price)}</p>
            </div>
            <div className="flex h-9 shrink-0 items-center rounded-lg border border-border">
              <button
                type="button"
                disabled={isPending}
                onClick={() => updateQuantity(line.itemId, line.quantity - 1)}
                className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => updateQuantity(line.itemId, line.quantity + 1)}
                className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <p className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
              {formatPrice(line.product.price * line.quantity)}
            </p>
            <button
              type="button"
              disabled={isPending}
              onClick={() => removeItem(line.itemId)}
              aria-label="Remove item"
              className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Order Summary</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({cart.itemCount} items)</span>
            <span className="tabular-nums text-foreground">{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{cart.subtotal >= 50 ? "Free" : "Calculated at checkout"}</span>
          </div>
        </div>
        <Button render={<Link href="/checkout" />} nativeButton={false} className="mt-4 w-full" size="lg" disabled={isPending}>
          Checkout
        </Button>
      </div>
    </div>
  );
}
