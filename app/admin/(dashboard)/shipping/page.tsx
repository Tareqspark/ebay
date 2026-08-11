import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Panel } from "@/components/admin/shared/panel";
import { ShippingRatesTable } from "@/components/admin/shipping/shipping-rates-table";
import { CarriersGrid } from "@/components/admin/shipping/carriers-grid";
import { FreeShippingRulesPanel } from "@/components/admin/shipping/free-shipping-rules-panel";
import { getShippingRates, getCarriers } from "@/lib/admin/shipping";
import { getShippingRulesForAdmin } from "@/lib/shipping-thresholds";

export const metadata: Metadata = { title: "Shipping" };

export default async function AdminShippingPage() {
  const [rates, carriers, freeShippingRules] = await Promise.all([
    getShippingRates(),
    getCarriers(),
    getShippingRulesForAdmin(),
  ]);
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Shipping" description="Rates, zones, and connected carriers" />

      <Panel title="Carriers" description="Click a carrier to update its connection and services" bodyClassName="p-4">
        <CarriersGrid carriers={carriers} />
      </Panel>

      <FreeShippingRulesPanel rules={freeShippingRules} />

      <ShippingRatesTable rates={rates} carriers={carriers} />
    </div>
  );
}
