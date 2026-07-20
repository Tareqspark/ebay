import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { CampaignsTable } from "@/components/admin/marketing/campaigns-table";
import { CAMPAIGNS } from "@/lib/admin/marketing";
import { formatCompactMoney, formatNumber } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Marketing" };

export default function AdminMarketingPage() {
  const active = CAMPAIGNS.filter((c) => c.status === "active");
  const totalRedemptions = CAMPAIGNS.reduce((s, c) => s + c.redemptions, 0);
  const totalRevenue = CAMPAIGNS.reduce((s, c) => s + c.revenueAttributed, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Marketing"
        description="Discount codes, email campaigns, and on-site banners."
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New campaign
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Active campaigns" value={String(active.length)} />
        <KpiCard label="Total campaigns" value={String(CAMPAIGNS.length)} />
        <KpiCard label="Redemptions" value={formatNumber(totalRedemptions)} />
        <KpiCard label="Revenue attributed" value={formatCompactMoney(totalRevenue)} />
      </div>
      <CampaignsTable campaigns={CAMPAIGNS} />
    </div>
  );
}
