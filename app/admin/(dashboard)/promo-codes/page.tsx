import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { PromoCodesTable } from "@/components/admin/promo-codes/promo-codes-table";
import { getPromoCodes, getPromoStats } from "@/lib/admin/promos";
import { formatCompactMoney, formatNumber } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Promo Codes" };

export default async function AdminPromoCodesPage() {
  const [promoCodes, stats] = await Promise.all([getPromoCodes(), getPromoStats()]);
  const active = promoCodes.filter((p) => p.status === "active");
  const totalRedemptions = promoCodes.reduce((s, p) => s + p.usageCount, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Promo Codes"
        description="Create and manage discount codes — percentage off, fixed amount off, or free delivery."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Active codes" value={String(active.length)} />
        <KpiCard label="Total codes" value={String(promoCodes.length)} />
        <KpiCard label="Redemptions" value={formatNumber(totalRedemptions)} />
        <KpiCard label="Discount given" value={formatCompactMoney(stats.totalDiscountGiven)} />
      </div>
      <PromoCodesTable promoCodes={promoCodes} />
    </div>
  );
}
