import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { CjTabs } from "@/components/admin/cj/cj-tabs";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { ORDERS, CJ_DISPUTES, PRODUCT_META, getCustomer, CJ_INTEGRATION_SETTINGS } from "@/lib/admin/data";
import { formatDate, formatMoney, formatPercent } from "@/lib/admin/format";

export const metadata: Metadata = { title: "CJdropshipping" };

export default function AdminCjOverviewPage() {
  const cjProducts = PRODUCT_META.filter((m) => m.source === "cj").length;
  const cjShare = PRODUCT_META.length > 0 ? cjProducts / PRODUCT_META.length : 0;

  const awaitingPush = ORDERS.filter((o) => o.cjSyncStatus === "not_sent").sort(
    (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime()
  );
  const openDisputes = CJ_DISPUTES.filter((d) => d.status === "open" || d.status === "awaiting_cj").sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="CJdropshipping" description="Hybrid sourcing operations — dropshipped via CJdropshipping" />
      <CjTabs />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Wallet balance" value={formatMoney(CJ_INTEGRATION_SETTINGS.walletBalance)} href="/admin/cj/settings" />
        <KpiCard label="Orders awaiting push" value={String(awaitingPush.length)} alert={awaitingPush.length > 0} href="/admin/cj/orders" />
        <KpiCard label="Open disputes" value={String(openDisputes.length)} alert={openDisputes.length > 0} href="/admin/cj/after-sales" />
        <KpiCard label="Share of catalog" value={`${formatPercent(cjShare * 100)} · ${cjProducts.toLocaleString()} products`} href="/admin/cj/catalog" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Orders awaiting push</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Paid orders with CJ items not yet sent to CJ</p>
            </div>
            <Link href="/admin/cj/orders" className="text-xs font-medium text-foreground hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {awaitingPush.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">Nothing waiting — all caught up.</p>
            )}
            {awaitingPush.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="truncate text-xs text-muted-foreground">{getCustomer(order.customerId)?.name ?? order.customerId}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(order.placedAt)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Open disputes</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">After-sales claims needing action</p>
            </div>
            <Link href="/admin/cj/after-sales" className="text-xs font-medium text-foreground hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {openDisputes.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">No open disputes.</p>
            )}
            {openDisputes.slice(0, 5).map((dispute) => (
              <div key={dispute.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{dispute.productTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {dispute.orderId} · {formatMoney(dispute.amount)}
                  </p>
                </div>
                <StatusBadge status={dispute.status} className="shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
