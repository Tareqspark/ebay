import Link from "next/link";
import { FreeShippingStatus } from "@/components/layout/free-shipping-status";
import { ShipToSelect } from "@/components/layout/ship-to-select";
import { getShipToCountry } from "@/lib/ship-to";
import { getShippingRule } from "@/lib/shipping-thresholds";
import { getCountry } from "@/lib/countries";

export async function TopBar() {
  const shipTo = await getShipToCountry();
  // Resolved here rather than in the client component: the rule is a
  // database read, and the strip has to describe the destination the
  // shopper actually picked.
  const rule = await getShippingRule(shipTo);

  return (
    <div className="hidden bg-foreground text-background sm:block">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-1.5 text-xs">
        <div className="flex items-center gap-4">
          <FreeShippingStatus rule={rule} countryName={getCountry(shipTo).name} />
          <ShipToSelect value={shipTo} />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/account/orders" className="hover:underline">
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
