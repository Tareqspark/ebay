"use client";

import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { getCart, addToCart, updateCartItemQuantity, removeCartItem, type CartSummary } from "@/lib/cart";

const EMPTY_CART: CartSummary = { cartId: null, items: [], itemCount: 0, subtotal: 0 };

interface CartContextValue {
  cart: CartSummary;
  isPending: boolean;
  addItem: (productId: string, quantity?: number) => void;
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
    <CartContext.Provider value={{ cart, isPending, addItem, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
