import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Band } from "@/lib/admin/dashboard-charts";

/**
 * One stacked bar plus a legend, for a whole that divides into a handful of
 * states — margin bands, stock health, order age.
 *
 * Colour here is *status*, not series identity: it always runs good →
 * warning → critical, never an arbitrary palette, so the same red means the
 * same thing on every one of these. Each band is also labelled with its
 * count, so the reading never depends on colour alone.
 */

const FILL: Record<Band["tone"], string> = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  neutral: "bg-slate-400",
};

const DOT: Record<Band["tone"], string> = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  neutral: "bg-slate-400",
};

export function DistributionBar({
  title,
  subtitle,
  bands,
  unit,
}: {
  title: string;
  subtitle?: string;
  bands: Band[];
  unit: string;
}) {
  const total = bands.reduce((sum, b) => sum + b.count, 0);

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <p className="py-3 text-xs text-muted-foreground">Nothing to show yet.</p>
      ) : (
        <>
          {/* 2px gaps between segments rather than hairline borders, so
              adjacent fills stay distinguishable at any width. */}
          <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
            {bands
              .filter((b) => b.count > 0)
              .map((b) => (
                <div
                  key={b.label}
                  className={cn("h-full first:rounded-l-full last:rounded-r-full", FILL[b.tone])}
                  style={{ width: `${(b.count / total) * 100}%` }}
                  title={`${b.label}: ${b.count.toLocaleString()}`}
                />
              ))}
          </div>

          <ul className="mt-3 flex flex-col gap-1.5">
            {bands.map((b) => {
              const row = (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[b.tone])} />
                    <span className="text-foreground">{b.label}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {b.count.toLocaleString()}
                    <span className="ml-1 text-[10px]">
                      {total > 0 ? `${Math.round((b.count / total) * 100)}%` : ""}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={b.label} className="text-xs">
                  {b.href && b.count > 0 ? (
                    <Link href={b.href} className="flex items-center justify-between rounded px-1 py-0.5 -mx-1 hover:bg-muted">
                      {row}
                    </Link>
                  ) : (
                    <span className="flex items-center justify-between px-1 py-0.5">{row}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
            {total.toLocaleString()} {unit}
          </p>
        </>
      )}
    </section>
  );
}
