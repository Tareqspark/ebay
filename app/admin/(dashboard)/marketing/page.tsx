import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { CampaignsTable } from "@/components/admin/marketing/campaigns-table";
import { getCampaigns } from "@/lib/admin/marketing";
import { formatCompactMoney, formatNumber } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Marketing" };

export default async function AdminMarketingPage() {
  const campaigns = await getCampaigns();
  const active = campaigns.filter((c) => c.status === "active");
  const totalRedemptions = campaigns.reduce((s, c) => s + c.redemptions, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenueAttributed, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Marketing" description="Discount codes, email campaigns, and on-site banners." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Active campaigns" value={String(active.length)} />
        <KpiCard label="Total campaigns" value={String(campaigns.length)} />
        <KpiCard label="Redemptions" value={formatNumber(totalRedemptions)} />
        <KpiCard label="Revenue attributed" value={formatCompactMoney(totalRevenue)} />
      </div>
      <CampaignsTable campaigns={campaigns} />
    </div>
  );
}
