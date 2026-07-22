import { getDashboardKpis } from "@/lib/admin/metrics";
import { formatCompactMoney, formatNumber, percentChange } from "@/lib/admin/format";
import { KpiCard } from "@/components/admin/shared/kpi-card";

export async function KpiGrid() {
  const kpis = await getDashboardKpis();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        label="Revenue today"
        value={formatCompactMoney(kpis.revenueToday)}
        change={percentChange(kpis.revenueToday, kpis.revenueYesterday)}
        href="/admin/analytics"
      />
      <KpiCard
        label="Orders today"
        value={formatNumber(kpis.ordersToday)}
        change={percentChange(kpis.ordersToday, kpis.ordersYesterday)}
        href="/admin/orders"
      />
      <KpiCard
        label="Pending orders"
        value={formatNumber(kpis.pendingOrders)}
        href="/admin/orders?status=pending"
      />
      <KpiCard
        label="Products imported today"
        value={formatNumber(kpis.productsImportedToday)}
        href="/admin/supplier/history"
      />
      <KpiCard
        label="Low inventory"
        value={formatNumber(kpis.lowInventoryCount)}
        alert={kpis.lowInventoryCount > 0}
        href="/admin/inventory?status=low_stock"
      />
      <KpiCard
        label="Failed payments"
        value={formatNumber(kpis.failedPaymentsToday)}
        alert={kpis.failedPaymentsToday > 0}
        href="/admin/payments?tab=failed"
      />
    </div>
  );
}
