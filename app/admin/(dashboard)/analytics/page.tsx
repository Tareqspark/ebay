import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { Panel } from "@/components/admin/shared/panel";
import { RevenueTrendChart } from "@/components/admin/analytics/revenue-trend-chart";
import { RankedList } from "@/components/admin/analytics/ranked-list";
import {
  getAnalyticsSummary,
  getRevenueSeries,
  getTopBrands,
  getTopCategories,
  getTopCustomers,
  getTopProducts,
} from "@/lib/admin/metrics";
import { formatCompactMoney, formatNumber, formatPercent, percentChange } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const [summary, series, topCategories, topProducts, topBrands, topCustomers] = await Promise.all([
    getAnalyticsSummary(),
    getRevenueSeries(30),
    getTopCategories(),
    getTopProducts(),
    getTopBrands(),
    getTopCustomers(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Analytics" description="Last 30 days vs the prior 30 days" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Revenue" value={formatCompactMoney(summary.revenue30d)} change={percentChange(summary.revenue30d, summary.revenuePrev30d)} />
        <KpiCard label="Profit" value={formatCompactMoney(summary.profit30d)} />
        <KpiCard label="Orders" value={formatNumber(summary.orders30d)} change={percentChange(summary.orders30d, summary.ordersPrev30d)} />
        <KpiCard label="Avg order value" value={formatCompactMoney(summary.averageOrderValue)} />
        <KpiCard label="Conversion rate" value={formatPercent(summary.conversionRate)} />
        <KpiCard label="Refund rate" value={formatPercent(summary.refundRate)} invertChangeColor />
      </div>

      <Panel title="Revenue" description="Last 30 days" bodyClassName="p-4">
        <RevenueTrendChart points={series} />
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RankedList title="Top categories" entries={topCategories} />
        <RankedList title="Top products" entries={topProducts} />
        <RankedList title="Top brands" entries={topBrands} />
        <RankedList title="Top customers" entries={topCustomers} />
      </div>
    </div>
  );
}
