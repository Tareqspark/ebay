"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

const STORAGE_KEY = "recently-viewed-products";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [ids, setIds, hydrated] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const recordView = useCallback(
    (productId: string) => {
      setIds((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_ITEMS));
    },
    [setIds]
  );

  return { ids, recordView, hydrated };
}
