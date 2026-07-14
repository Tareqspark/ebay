import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductBadgesProps {
  product: Product;
  className?: string;
}

export function ProductBadges({ product, className }: ProductBadgesProps) {
  const badges: { label: string; className: string }[] = [];

  if (product.isFlashSale) {
    badges.push({ label: "Flash Sale", className: "bg-red-600 text-white" });
  }
  if (product.isDeal && !product.isFlashSale) {
    badges.push({ label: "Deal", className: "bg-orange-500 text-white" });
  }
  if (product.isNewArrival) {
    badges.push({ label: "New", className: "bg-sky-600 text-white" });
  }
  if (product.isBestSeller) {
    badges.push({ label: "Best Seller", className: "bg-amber-500 text-white" });
  }
  if (product.stock === 0) {
    badges.push({ label: "Out of Stock", className: "bg-muted text-muted-foreground" });
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <Badge key={b.label} className={cn("border-0 px-2 py-0.5 text-[11px] font-medium", b.className)}>
          {b.label}
        </Badge>
      ))}
    </div>
  );
}
