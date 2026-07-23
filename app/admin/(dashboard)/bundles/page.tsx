import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { BundlesTable } from "@/components/admin/bundles/bundles-table";
import { getAdminBundles } from "@/lib/admin/bundles";

export const metadata: Metadata = { title: "Bundles" };

export default async function AdminBundlesPage() {
  const bundles = await getAdminBundles();
  const active = bundles.filter((b) => b.status === "active");

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Bundles"
        description="Bundle discounts apply automatically when a cart contains every product in an active bundle."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Active bundles" value={String(active.length)} />
        <KpiCard label="Total bundles" value={String(bundles.length)} />
      </div>
      <BundlesTable bundles={bundles} />
    </div>
  );
}
