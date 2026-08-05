"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

const STORAGE_KEY = "wishlist-products";

export function useWishlist() {
  const [ids, setIds, hydrated] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const isInWishlist = useCallback((productId: string) => ids.includes(productId), [ids]);

  const toggle = useCallback(
    (productId: string) => {
      setIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [productId, ...prev]));
    },
    [setIds]
  );

  const remove = useCallback(
    (productId: string) => {
      setIds((prev) => prev.filter((id) => id !== productId));
    },
    [setIds]
  );

  return { ids, hydrated, isInWishlist, toggle, remove };
}
