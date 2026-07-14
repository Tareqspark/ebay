"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

const STORAGE_KEY = "recent-searches";
const MAX_ITEMS = 8;

export function useRecentSearches() {
  const [searches, setSearches, hydrated] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const addSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      setSearches((prev) => [trimmed, ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_ITEMS));
    },
    [setSearches]
  );

  const clearSearches = useCallback(() => setSearches([]), [setSearches]);
  const removeSearch = useCallback(
    (query: string) => setSearches((prev) => prev.filter((s) => s !== query)),
    [setSearches]
  );

  return { searches, addSearch, clearSearches, removeSearch, hydrated };
}
