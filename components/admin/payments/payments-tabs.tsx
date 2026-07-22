"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/table/data-table";
import { paymentColumns, disputeColumns, payoutColumns } from "@/components/admin/payments/columns";
import type { AdminDisputeRow, AdminPaymentRow } from "@/lib/admin/data";
import type { Payout } from "@/lib/admin/types";

interface PaymentsTabsProps {
  payments: AdminPaymentRow[];
  disputes: AdminDisputeRow[];
  payouts: Payout[];
  initialTab?: string;
}

export function PaymentsTabs({ payments, disputes, payouts, initialTab }: PaymentsTabsProps) {
  const [tab, setTab] = useState(initialTab ?? "successful");

  const successful = useMemo(() => payments.filter((p) => p.status === "succeeded"), [payments]);
  const pending = useMemo(() => payments.filter((p) => p.status === "pending"), [payments]);
  const refunded = useMemo(() => payments.filter((p) => p.status === "refunded"), [payments]);
  const failed = useMemo(() => payments.filter((p) => p.status === "failed"), [payments]);

  return (
    <Tabs value={tab} onValueChange={(v) => v && setTab(v)}>
      <TabsList>
        <TabsTrigger value="successful">Successful ({successful.length})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
        <TabsTrigger value="refunds">Refunds ({refunded.length})</TabsTrigger>
        <TabsTrigger value="disputes">Disputes ({disputes.length})</TabsTrigger>
        <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
        <TabsTrigger value="payouts">Payouts ({payouts.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="successful" className="pt-4">
        <DataTable columns={paymentColumns} data={successful} getRowId={(p) => p.id} emptyMessage="No successful payments." />
      </TabsContent>
      <TabsContent value="pending" className="pt-4">
        <DataTable columns={paymentColumns} data={pending} getRowId={(p) => p.id} emptyMessage="No pending payments." />
      </TabsContent>
      <TabsContent value="refunds" className="pt-4">
        <DataTable columns={paymentColumns} data={refunded} getRowId={(p) => p.id} emptyMessage="No refunds." />
      </TabsContent>
      <TabsContent value="disputes" className="pt-4">
        <DataTable columns={disputeColumns} data={disputes} getRowId={(d) => d.id} emptyMessage="No open disputes." />
      </TabsContent>
      <TabsContent value="failed" className="pt-4">
        <DataTable columns={paymentColumns} data={failed} getRowId={(p) => p.id} emptyMessage="No failed payments." />
      </TabsContent>
      <TabsContent value="payouts" className="pt-4">
        <DataTable columns={payoutColumns} data={payouts} getRowId={(p) => p.id} emptyMessage="No payouts yet." />
      </TabsContent>
    </Tabs>
  );
}
