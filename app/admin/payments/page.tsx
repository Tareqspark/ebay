import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { PaymentsTabs } from "@/components/admin/payments/payments-tabs";
import { getPayments, getDisputes, getPayouts } from "@/lib/admin/data";
import { formatCompactMoney } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Payments" };

interface PaymentsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: PaymentsPageProps) {
  const [{ tab }, payments, disputes, payouts] = await Promise.all([
    searchParams,
    getPayments(),
    getDisputes(),
    getPayouts(),
  ]);
  const succeeded = payments.filter((p) => p.status === "succeeded");
  const totalVolume = succeeded.reduce((s, p) => s + p.amount, 0);
  const totalFees = succeeded.reduce((s, p) => s + p.processorFee, 0);
  const openDisputes = disputes.filter((d) => d.status === "needs_response" || d.status === "under_review").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Payments" description="Transactions, refunds, disputes, and payout history" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Payment volume" value={formatCompactMoney(totalVolume)} />
        <KpiCard label="Processor fees" value={formatCompactMoney(totalFees)} />
        <KpiCard label="Open disputes" value={String(openDisputes)} alert={openDisputes > 0} />
        <KpiCard label="Payouts" value={String(payouts.length)} />
      </div>
      <PaymentsTabs payments={payments} disputes={disputes} payouts={payouts} initialTab={tab} />
    </div>
  );
}
