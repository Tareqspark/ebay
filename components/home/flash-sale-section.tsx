"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { ProductRail } from "@/components/product/product-rail";
import type { Product } from "@/lib/types";

const SALE_WINDOW_MS = 8 * 60 * 60 * 1000;

function getEndOfWindow() {
  const stored = typeof window !== "undefined" ? window.sessionStorage.getItem("flash-sale-end") : null;
  if (stored) {
    const t = Number(stored);
    if (t > Date.now()) return t;
  }
  const end = Date.now() + SALE_WINDOW_MS;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("flash-sale-end", String(end));
  }
  return end;
}

function useCountdown(target: number | null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (target === null) return;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export function FlashSaleSection({ products }: { products: Product[] }) {
  const [target, setTarget] = useState<number | null>(null);
  useEffect(() => setTarget(getEndOfWindow()), []);
  const { hours, minutes, seconds } = useCountdown(target);

  if (products.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="flash-sale" className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-5 dark:border-red-900/40 dark:from-red-950/20 dark:to-orange-950/10 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white">
            <Zap className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Flash Sale</h2>
        </div>
        {target !== null && (
          <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-red-700 dark:text-red-400">
            <span>Ends in</span>
            {[hours, minutes, seconds].map((v, i) => (
              <span key={i} className="rounded-md bg-red-600 px-2 py-1 text-white">
                {pad(v)}
              </span>
            ))}
          </div>
        )}
      </div>
      <ProductRail title="" products={products} accent="flash" hideHeader />
    </section>
  );
}
