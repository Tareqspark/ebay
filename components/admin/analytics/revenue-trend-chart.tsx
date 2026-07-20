"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { RevenuePoint } from "@/lib/admin/metrics";

/**
 * Single-series daily revenue bar chart. No legend (single series — the
 * section title already names the series). Bars are capped at 24px, 4px
 * rounded top / square baseline, 2px gap, per-bar hover tooltip — see the
 * dataviz skill's mark spec. Neutral (foreground) fill to stay inside the
 * admin's monochrome-first palette rather than introducing a new hue.
 */
export function RevenueTrendChart({ points }: { points: RevenuePoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.revenue), 1);
  const niceMax = Math.ceil(max / 5000) * 5000 || 5000;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="flex flex-col justify-between py-1 text-right text-[11px] tabular-nums text-muted-foreground">
          <span>{formatMoney(niceMax)}</span>
          <span>{formatMoney(niceMax / 2)}</span>
          <span>$0</span>
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col justify-between">
            <div className="border-t border-border/60" />
            <div className="border-t border-border/60" />
            <div className="border-t border-border" />
          </div>
          <div className="relative flex h-48 gap-[2px]">
            {points.map((p, i) => {
              const heightPct = Math.max((p.revenue / niceMax) * 100, p.revenue > 0 ? 2 : 0);
              const isHovered = hovered === i;
              return (
                <div
                  key={p.date}
                  className="group relative h-full flex-1"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                  tabIndex={0}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered((h) => (h === i ? null : h))}
                >
                  <div
                    className={cn(
                      "absolute bottom-0 left-1/2 w-full max-w-[24px] -translate-x-1/2 rounded-t-[4px] bg-foreground/70 transition-colors",
                      isHovered && "bg-foreground"
                    )}
                    style={{ height: `${heightPct}%` }}
                  />
                  {isHovered && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                      <p className="font-semibold tabular-nums text-foreground">{formatMoney(p.revenue)}</p>
                      <p className="text-muted-foreground">
                        {p.label} · {p.orders} order{p.orders === 1 ? "" : "s"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-[52px] flex gap-[2px]">
        {points.map((p, i) => (
          <div key={p.date} className="flex-1 text-center text-[10px] text-muted-foreground">
            {i % 5 === 0 ? p.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
