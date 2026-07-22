"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { getDisputeColumns } from "@/components/admin/cj/dispute-columns";
import { resolveCjDisputeAction, rejectCjDisputeAction } from "@/lib/admin/cj-dispute-actions";
import { formatMoney } from "@/lib/admin/format";
import type { AdminCjDisputeRow } from "@/lib/admin/data";

export function DisputesTable({ initialDisputes }: { initialDisputes: AdminCjDisputeRow[] }) {
  const [disputes, setDisputes] = useState(initialDisputes);
  const [status, setStatus] = useState("all");

  const open = disputes.filter((d) => d.status === "open").length;
  const awaitingCj = disputes.filter((d) => d.status === "awaiting_cj").length;
  const resolved = disputes.filter((d) => d.status.startsWith("resolved")).length;
  const amountAtRisk = disputes
    .filter((d) => d.status === "open" || d.status === "awaiting_cj")
    .reduce((s, d) => s + d.amount, 0);

  const filtered = useMemo(() => disputes.filter((d) => status === "all" || d.status === status), [disputes, status]);

  function updateStatus(id: string, status: AdminCjDisputeRow["status"]) {
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d)));
  }

  const columns = useMemo(
    () =>
      getDisputeColumns({
        onResolve: async (id, resolveStatus) => {
          const result = await resolveCjDisputeAction(id, resolveStatus);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          updateStatus(id, resolveStatus);
          toast.success(resolveStatus === "resolved_reship" ? "Reshipment requested from CJ" : "Refund requested from CJ");
        },
        onReject: async (id) => {
          const result = await rejectCjDisputeAction(id);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          updateStatus(id, "rejected");
          toast.success("Dispute rejected");
        },
      }),
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Open" value={String(open)} alert={open > 0} />
        <KpiCard label="Awaiting CJ" value={String(awaitingCj)} />
        <KpiCard label="Resolved" value={String(resolved)} />
        <KpiCard label="Amount at risk" value={formatMoney(amountAtRisk)} />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(d) => d.id}
        emptyMessage="No after-sales disputes match these filters."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search order or product..." />
            <FilterSelect
              value={status}
              onChange={setStatus}
              allLabel="All statuses"
              options={[
                { value: "open", label: "Open" },
                { value: "awaiting_cj", label: "Awaiting CJ" },
                { value: "resolved_reship", label: "Resolved — reshipped" },
                { value: "resolved_refund", label: "Resolved — refunded" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </>
        )}
      />
    </div>
  );
}
