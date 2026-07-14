"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export function RecordRecentlyViewed({ productId }: { productId: string }) {
  const { recordView } = useRecentlyViewed();

  useEffect(() => {
    recordView(productId);
  }, [productId, recordView]);

  return null;
}
