import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/format";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RatingStars({ rating, count, size = "sm", className }: RatingStarsProps) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  const pct = Math.max(0, Math.min(1, rating / 5)) * 100;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative inline-flex">
        <div className="flex gap-0.5 text-muted-foreground/30">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(starSize, "fill-current")} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-500"
          style={{ width: `${pct}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(starSize, "fill-current shrink-0")} />
          ))}
        </div>
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">
          {rating.toFixed(1)} ({formatCompactNumber(count)})
        </span>
      )}
    </div>
  );
}
