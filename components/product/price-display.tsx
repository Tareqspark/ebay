import { cn } from "@/lib/utils";
import { formatPrice, discountPercent } from "@/lib/format";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({ price, originalPrice, size = "md", className }: PriceDisplayProps) {
  const pct = discountPercent(price, originalPrice);
  const priceSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-semibold text-foreground tabular-nums", priceSize)}>
        {formatPrice(price)}
      </span>
      {originalPrice && pct && (
        <>
          <span className="text-sm text-muted-foreground line-through tabular-nums">
            {formatPrice(originalPrice)}
          </span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
            -{pct}%
          </span>
        </>
      )}
    </div>
  );
}
