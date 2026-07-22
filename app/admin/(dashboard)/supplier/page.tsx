import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { SuppliersTable } from "@/components/admin/supplier/suppliers-table";
import { getSuppliers } from "@/lib/admin/data";
import { formatNumber } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Supplier" };

export default async function AdminSupplierOverviewPage() {
  const suppliers = await getSuppliers();
  const active = suppliers.filter((s) => s.status === "active").length;
  const totalProducts = suppliers.reduce((s, sup) => s + sup.productsSupplied, 0);
  const avgFulfillment = suppliers.length > 0 ? suppliers.reduce((s, sup) => s + sup.avgFulfillmentDays, 0) / suppliers.length : 0;
  const disconnected = suppliers.filter((s) => s.status === "disconnected").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Supplier" description={`${suppliers.length} connected suppliers`} />
      <SupplierTabs />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Active suppliers" value={String(active)} />
        <KpiCard label="Products supplied" value={formatNumber(totalProducts)} />
        <KpiCard label="Avg fulfillment" value={`${avgFulfillment.toFixed(1)} days`} />
        <KpiCard label="Disconnected" value={String(disconnected)} alert={disconnected > 0} />
      </div>
      <SuppliersTable suppliers={suppliers} />
    </div>
  );
}
