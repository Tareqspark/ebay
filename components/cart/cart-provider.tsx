"use client";

import { toast } from "sonner";
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
    getCart()
      .then(setCart)
      .catch(() => {
        // Leave the cart empty rather than unhandled-rejecting; the next
        // mutation refetches it.
      });
  }, []);

  /**
   * Every mutation runs through here so a failing server action can never
   * strand the transition. useTransition only clears isPending when the
   * async body settles, and an unguarded throw leaves it stuck true — which
   * disabled the Checkout button permanently and looked like "the cart
   * button stopped working".
   */
  function runCartAction(action: () => Promise<CartSummary>) {
    startTransition(async () => {
      try {
        setCart(await action());
      } catch {
        toast.error("Couldn't update your cart — please try again.");
      }
    });
  }

  function addItem(productId: string, quantity = 1) {
    runCartAction(() => addToCart(productId, quantity));
  }
  /** Adds every product in a bundle within one transition, so the cart only re-renders once with the final state instead of flickering through each intermediate add. */
  function addBundle(productIds: string[]) {
    runCartAction(async () => {
      let latest = cart;
      for (const productId of productIds) {
        latest = await addToCart(productId, 1);
      }
      return latest;
    });
  }
  function updateQuantity(itemId: string, quantity: number) {
    runCartAction(() => updateCartItemQuantity(itemId, quantity));
  }
  function removeItem(itemId: string) {
    runCartAction(() => removeCartItem(itemId));
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
