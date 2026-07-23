"use client";

import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { getCart, addToCart, updateCartItemQuantity, removeCartItem, type CartSummary } from "@/lib/cart";

const EMPTY_CART: CartSummary = { cartId: null, items: [], itemCount: 0, subtotal: 0, bundleDiscount: 0, appliedBundles: [] };

interface CartContextValue {
  cart: CartSummary;
  isPending: boolean;
  addItem: (productId: string, quantity?: number) => void;
  addBundle: (productIds: string[]) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCart().then(setCart);
  }, []);

  function addItem(productId: string, quantity = 1) {
    startTransition(async () => {
      setCart(await addToCart(productId, quantity));
    });
  }
  /** Adds every product in a bundle within one transition, so the cart only re-renders once with the final state instead of flickering through each intermediate add. */
  function addBundle(productIds: string[]) {
    startTransition(async () => {
      let latest = cart;
      for (const productId of productIds) {
        latest = await addToCart(productId, 1);
      }
      setCart(latest);
    });
  }
  function updateQuantity(itemId: string, quantity: number) {
    startTransition(async () => {
      setCart(await updateCartItemQuantity(itemId, quantity));
    });
  }
  function removeItem(itemId: string) {
    startTransition(async () => {
      setCart(await removeCartItem(itemId));
    });
  }

  return (
    <CartContext.Provider value={{ cart, isPending, addItem, addBundle, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
