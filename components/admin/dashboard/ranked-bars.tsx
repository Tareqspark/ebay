import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RankedBar } from "@/lib/admin/dashboard-charts";

/**
 * Horizontal bars for comparing magnitudes across named things.
 *
 * Horizontal rather than vertical because the labels are words, not dates —
 * they read straight across instead of being rotated. And bars rather than a
 * pie: past about three slices, judging angle against angle is guesswork,
 * while bar length is read exactly.
 *
 * `ordered` distinguishes a ranking, which sorts by size, from a histogram,
 * whose bands have an inherent order that sorting would destroy.
 */
export function RankedBars({
  title,
  subtitle,
  bars,
  unit,
  ordered = false,
  formatLabel = (l) => l,
}: {
  title: string;
  subtitle?: string;
  bars: RankedBar[];
  unit: string;
  /** True when the sequence itself carries meaning (price bands, ratings) and must not be re-sorted. */
  ordered?: boolean;
  formatLabel?: (label: string) => string;
}) {
  const rows = ordered ? bars : [...bars].sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...rows.map((b) => b.value));
  const total = rows.reduce((sum, b) => sum + b.value, 0);

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
          <ul className="flex flex-col gap-1.5">
            {rows.map((b) => {
              const pct = (b.value / max) * 100;
              const body = (
                <>
                  <span className="w-28 shrink-0 truncate text-xs capitalize text-muted-foreground" title={formatLabel(b.label)}>
                    {formatLabel(b.label)}
                  </span>
                  <span className="relative h-4 flex-1 overflow-hidden rounded-sm bg-muted">
                    {/* Rounded only on the data end, anchored flat to the baseline. */}
                    <span
                      className="absolute inset-y-0 left-0 rounded-r-sm bg-orange-500/80"
                      style={{ width: `${Math.max(pct, b.value > 0 ? 1.5 : 0)}%` }}
                    />
                  </span>
                  <span className="w-16 shrink-0 text-right text-xs tabular-nums text-foreground">
                    {b.value.toLocaleString()}
                  </span>
                </>
              );
              return (
                <li key={b.label}>
                  {b.href ? (
                    <Link href={b.href} className={cn("flex items-center gap-2 rounded px-1 py-0.5 -mx-1 hover:bg-muted/60")}>
                      {body}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 px-1 py-0.5">{body}</span>
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
