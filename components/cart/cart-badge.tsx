"use client";

import { useCart } from "@/components/cart/cart-provider";

export function CartBadge() {
  const { cart } = useCart();
  if (cart.itemCount === 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
      {cart.itemCount > 99 ? "99+" : cart.itemCount}
    </span>
  );
}
