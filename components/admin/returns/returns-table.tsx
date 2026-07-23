"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { getReturnColumns } from "@/components/admin/returns/columns";
import { approveReturnAction, rejectReturnAction } from "@/lib/admin/return-actions";
import { formatMoney } from "@/lib/admin/format";
import type { AdminReturn } from "@/lib/admin/returns";

export function ReturnsTable({ initialReturns }: { initialReturns: AdminReturn[] }) {
  const [returns, setReturns] = useState(initialReturns);
  const [status, setStatus] = useState("all");

  const requested = returns.filter((r) => r.status === "requested").length;
  const refunded = returns.filter((r) => r.status === "refunded").length;
  const amountRefunded = returns.filter((r) => r.status === "refunded").reduce((s, r) => s + r.refundAmount, 0);

  const filtered = useMemo(() => returns.filter((r) => status === "all" || r.status === status), [returns, status]);

  function updateStatus(id: string, next: AdminReturn["status"]) {
    setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
  }

  const columns = useMemo(
    () =>
      getReturnColumns({
        onApprove: async (id) => {
          const result = await approveReturnAction(id);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          updateStatus(id, "refunded");
          toast.success("Return approved and refunded");
        },
        onReject: async (id) => {
          const result = await rejectReturnAction(id);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          updateStatus(id, "rejected");
          toast.success("Return rejected");
        },
      }),
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Awaiting review" value={String(requested)} alert={requested > 0} />
        <KpiCard label="Refunded" value={String(refunded)} />
        <KpiCard label="Total requests" value={String(returns.length)} />
        <KpiCard label="Amount refunded" value={formatMoney(amountRefunded)} />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(r) => r.id}
        emptyMessage="No return requests match these filters."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search order, product, or customer..." />
            <FilterSelect
              value={status}
              onChange={setStatus}
              allLabel="All statuses"
              options={[
                { value: "requested", label: "Requested" },
                { value: "refunded", label: "Refunded" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </>
        )}
      />
    </div>
  );
}
