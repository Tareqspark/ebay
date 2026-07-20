import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Panel } from "@/components/admin/shared/panel";
import { ShippingRatesTable } from "@/components/admin/shipping/shipping-rates-table";
import { CarrierCard } from "@/components/admin/shipping/carrier-card";
import { SHIPPING_RATES, CARRIERS } from "@/lib/admin/shipping";

export const metadata: Metadata = { title: "Shipping" };

export default function AdminShippingPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Shipping" description="Rates, zones, and connected carriers" />

      <Panel title="Carriers" bodyClassName="p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CARRIERS.map((c) => (
            <CarrierCard key={c.id} carrier={c} />
          ))}
        </div>
      </Panel>

      <ShippingRatesTable rates={SHIPPING_RATES} />
    </div>
  );
}
