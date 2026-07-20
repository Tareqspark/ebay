import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  change?: number | null;
  changeLabel?: string;
  /** For KPIs where an increase is bad (failed payments, low stock). */
  invertChangeColor?: boolean;
  href?: string;
  alert?: boolean;
}

export function KpiCard({
  label,
  value,
  change,
  changeLabel = "vs yesterday",
  invertChangeColor = false,
  href,
  alert = false,
}: KpiCardProps) {
  const isPositive = change !== null && change !== undefined && change >= 0;
  const good = invertChangeColor ? !isPositive : isPositive;

  const body = (
    <div
      className={cn(
        "flex h-full flex-col gap-1.5 rounded-lg border bg-card p-4 transition-colors",
        alert ? "border-red-200 dark:border-red-900/50" : "border-border",
        href && "hover:border-ring/40"
      )}
    >
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-semibold tabular-nums tracking-tight", alert ? "text-red-600 dark:text-red-400" : "text-foreground")}>
        {value}
      </p>
      {change !== null && change !== undefined && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              good ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}%
          </span>
          {changeLabel}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{body}</Link>;
  }
  return body;
}
