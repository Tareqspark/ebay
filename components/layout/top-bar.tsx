import Link from "next/link";
import { MapPin, Truck } from "lucide-react";

export function TopBar() {
  return (
    <div className="hidden bg-foreground text-background sm:block">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-1.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            Free shipping on orders over $50
          </span>
          <span className="hidden items-center gap-1.5 md:flex">
            <MapPin className="h-3.5 w-3.5" />
            Ship to: United States
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/orders" className="hover:underline">
            Track Order
          </Link>
          <Link href="/help" className="hover:underline">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
