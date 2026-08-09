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
import { HeatmapMatrix } from "@/components/admin/dashboard/heatmap-matrix";
import { RankedBars } from "@/components/admin/dashboard/ranked-bars";
import {
  getDashboardCharts,
  getPriceMarginMatrix,
  getDepartmentStockMatrix,
  getDepartmentRanking,
  getCatalogHistograms,
} from "@/lib/admin/dashboard-charts";

/** Slugs are what the database groups by; the dashboard shouldn't show them raw. */
function titleise(slug: string): string {
  return slug.replace(/-and-/g, " & ").replace(/-/g, " ");
}

const STOCK_LABELS: Record<string, string> = {
  in_stock: "In stock",
  low_stock: "Low",
  out_of_stock: "Out",
  backorder: "Backorder",
};

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [charts, priceMargin, deptStock, deptRanking, histograms] = await Promise.all([
    getDashboardCharts(),
    getPriceMarginMatrix(),
    getDepartmentStockMatrix(),
    getDepartmentRanking(),
    getCatalogHistograms(),
  ]);

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

      {/* Densest first: a matrix answers "where" where a single bar only
          answers "how much". */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HeatmapMatrix
          title="Price against margin"
          subtitle="Whether the thin margins sit on cheap impulse items or on the lines meant to carry the business."
          matrix={priceMargin}
          rowLabel="Price"
          colLabel="Margin"
        />
        <HeatmapMatrix
          title="Stock by department"
          subtitle="A shortage concentrated in one department is invisible in an overall stock figure."
          matrix={deptStock}
          rowLabel="Dept"
          colLabel="Stock state"
          formatRow={titleise}
          formatCol={(c) => STOCK_LABELS[c] ?? c}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RankedBars
          title="Largest departments"
          subtitle="Where the catalog is concentrated."
          bars={deptRanking}
          unit="products in the top 10"
          formatLabel={titleise}
        />
        <RankedBars
          title="Price ladder"
          subtitle="Where the catalog sits on price."
          bars={histograms.price}
          unit="products priced"
          ordered
        />
        <RankedBars
          title="Rating spread"
          subtitle="Customer rating across the catalog."
          bars={histograms.rating}
          unit="products rated"
          ordered
        />
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
