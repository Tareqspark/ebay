import Link from "next/link";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardCharts } from "@/lib/admin/dashboard-charts";

/**
 * Counts that should be zero. Deliberately not a chart: each of these is one
 * number whose only interesting property is whether it is above zero, and a
 * bar chart of "things left to do" reads worse than the list itself.
 *
 * State is carried by icon and wording as well as colour, so it survives
 * being printed, or being read by someone who cannot separate red from green.
 */
export function ReadinessPanel({ items, emptyCategories }: { items: DashboardCharts["readiness"]; emptyCategories: number }) {
  const rows = [
    ...items,
    {
      label: "Subcategories with no products",
      count: emptyCategories,
      href: "/admin/categories",
      tone: "neutral" as const,
    },
  ];
  const allClear = rows.every((r) => r.count === 0);

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Needs attention</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Counts that should be zero.</p>

      {allClear ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" /> Nothing outstanding.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1">
          {rows.map((r) => (
            <li key={r.label}>
              <Link
                href={r.href}
                className="group flex items-center justify-between gap-3 rounded px-1.5 py-1.5 -mx-1.5 text-xs hover:bg-muted"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  {r.count > 0 ? (
                    <AlertTriangle
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        r.tone === "critical" ? "text-red-500" : r.tone === "warning" ? "text-amber-500" : "text-muted-foreground"
                      )}
                    />
                  ) : (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  )}
                  <span className="truncate text-foreground">{r.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <span
                    className={cn(
                      "tabular-nums font-medium",
                      r.count === 0
                        ? "text-muted-foreground"
                        : r.tone === "critical"
                          ? "text-red-600 dark:text-red-400"
                          : r.tone === "warning"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                    )}
                  >
                    {r.count.toLocaleString()}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
