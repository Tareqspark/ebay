import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiGrid } from "@/components/admin/dashboard/kpi-grid";
import { RecentOrdersPanel } from "@/components/admin/dashboard/recent-orders-panel";
import { SystemHealthPanel } from "@/components/admin/dashboard/system-health-panel";
import { ImportQueuePanel } from "@/components/admin/dashboard/import-queue-panel";
import { SupplierSyncPanel } from "@/components/admin/dashboard/supplier-sync-panel";
import { LatestCustomersPanel } from "@/components/admin/dashboard/latest-customers-panel";
import { ActivityFeedPanel } from "@/components/admin/dashboard/activity-feed-panel";
import { AnnouncementsPanel } from "@/components/admin/dashboard/announcements-panel";
import { DistributionBar } from "@/components/admin/dashboard/distribution-bar";
import { ReadinessPanel } from "@/components/admin/dashboard/readiness-panel";
import { getDashboardCharts } from "@/lib/admin/dashboard-charts";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const charts = await getDashboardCharts();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Dashboard"
        description={`${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} — here's what's happening today.`}
      />

      <KpiGrid />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersPanel />
        </div>
        <ActivityFeedPanel />
      </div>

      {/* Operations first: how much is waiting, and how old is it. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DistributionBar
          title="Orders awaiting action"
          subtitle="Age matters more than count — anything over 48h needs a reason."
          bands={charts.orderAging}
          unit="orders in the queue"
        />
        <DistributionBar
          title="Fulfilment pipeline"
          subtitle="Where every order currently sits."
          bands={charts.fulfilmentPipeline}
          unit="orders total"
        />
        <ReadinessPanel items={charts.readiness} emptyCategories={charts.emptyCategories} />
      </div>

      {/* Then the catalog, which is the dataset large enough to have a shape. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DistributionBar
          title="Margin across the catalog"
          subtitle="Retail price against cost, including CJ shipping fees."
          bands={charts.marginBands}
          unit="products priced"
        />
        <DistributionBar
          title="Stock health"
          subtitle="Own inventory only — CJ holds its own."
          bands={charts.stockHealth}
          unit="SKUs tracked"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ImportQueuePanel />
        <SupplierSyncPanel />
        <LatestCustomersPanel />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SystemHealthPanel />
        <AnnouncementsPanel />
      </div>
    </div>
  );
}
