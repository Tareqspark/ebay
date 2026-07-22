"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { importHistoryColumns } from "@/components/admin/supplier/columns";
import type { AdminImportJobRow } from "@/lib/admin/data";

export function ImportHistoryTable({ jobs }: { jobs: AdminImportJobRow[] }) {
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => jobs.filter((j) => status === "all" || j.status === status), [jobs, status]);

  return (
    <DataTable
      columns={importHistoryColumns}
      data={filtered}
      getRowId={(j) => j.id}
      emptyMessage="No import jobs match these filters."
      toolbar={(table) => (
        <>
          <TableSearch table={table} placeholder="Search job or supplier..." />
          <FilterSelect
            value={status}
            onChange={setStatus}
            allLabel="All statuses"
            options={[
              { value: "completed", label: "Completed" },
              { value: "failed", label: "Failed" },
            ]}
          />
        </>
      )}
    />
  );
}
