import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Matrix } from "@/lib/admin/dashboard-charts";

/**
 * A count per row/column pair, shaded by magnitude.
 *
 * One hue, light to dark. Magnitude has a single direction — more or less —
 * and a rainbow would invent categories that aren't there, while making
 * "which cell is bigger" a memory test against a legend. Every cell also
 * carries its number, so the shading is a scanning aid rather than the only
 * way to read the value.
 */

/** Fixed steps rather than a computed opacity: five distinguishable levels beat a smooth ramp nobody can tell apart. */
const STEPS = [
  "bg-transparent text-muted-foreground",
  "bg-primary/10 text-foreground",
  "bg-primary/25 text-foreground",
  "bg-primary/45 text-foreground",
  "bg-primary/65 text-foreground",
  "bg-primary/85 text-foreground",
];

function step(count: number, max: number): string {
  if (count === 0 || max === 0) return STEPS[0];
  // Square-root scale: counts here are heavily skewed, and a linear ramp
  // would leave every cell but the largest looking empty.
  const ratio = Math.sqrt(count) / Math.sqrt(max);
  return STEPS[Math.min(STEPS.length - 1, Math.max(1, Math.ceil(ratio * (STEPS.length - 1))))];
}

export function HeatmapMatrix({
  title,
  subtitle,
  matrix,
  rowLabel,
  colLabel,
  formatRow = (r) => r,
  formatCol = (c) => c,
}: {
  title: string;
  subtitle?: string;
  matrix: Matrix;
  rowLabel: string;
  colLabel: string;
  formatRow?: (row: string) => string;
  formatCol?: (col: string) => string;
}) {
  const at = (row: string, col: string) => matrix.cells.find((c) => c.row === row && c.col === col);
  const total = matrix.cells.reduce((sum, c) => sum + c.count, 0);

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
          {/* Its own scroll container: a wide grid must never make the page scroll sideways. */}
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0.5 text-xs">
              <thead>
                <tr>
                  <th className="w-px pr-2 text-left align-bottom text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {rowLabel}
                  </th>
                  {matrix.cols.map((c) => (
                    <th key={c} className="px-1 pb-1 text-center text-[10px] font-medium text-muted-foreground">
                      {formatCol(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map((r) => (
                  <tr key={r}>
                    <th className="whitespace-nowrap pr-2 text-right text-[11px] font-normal text-muted-foreground">
                      {formatRow(r)}
                    </th>
                    {matrix.cols.map((c) => {
                      const cell = at(r, c);
                      const count = cell?.count ?? 0;
                      const body = (
                        <span className="block rounded px-1 py-2 text-center tabular-nums">
                          {count === 0 ? "·" : count.toLocaleString()}
                        </span>
                      );
                      return (
                        <td key={c} className={cn("rounded", step(count, matrix.max))}>
                          {cell?.href && count > 0 ? (
                            <Link href={cell.href} title={`${formatRow(r)} · ${formatCol(c)}: ${count}`} className="block hover:opacity-80">
                              {body}
                            </Link>
                          ) : (
                            <span title={`${formatRow(r)} · ${formatCol(c)}: ${count}`}>{body}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
            <span>{colLabel} across →</span>
            <span className="flex items-center gap-1">
              Fewer
              {STEPS.slice(1).map((s, i) => (
                <span key={i} className={cn("h-2.5 w-4 rounded-sm", s.split(" ")[0])} />
              ))}
              More
            </span>
          </div>
        </>
      )}
    </section>
  );
}
