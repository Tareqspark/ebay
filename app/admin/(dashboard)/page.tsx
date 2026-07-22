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

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Dashboard" description="Wednesday, July 19 — here's what's happening today." />

      <KpiGrid />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersPanel />
        </div>
        <SystemHealthPanel />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ImportQueuePanel />
        <SupplierSyncPanel />
        <LatestCustomersPanel />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityFeedPanel />
        <AnnouncementsPanel />
      </div>
    </div>
  );
}
