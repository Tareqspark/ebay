"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { Button } from "@/components/ui/button";
import { getFailedImportColumns } from "@/components/admin/supplier/columns";
import type { AdminImportErrorRow } from "@/lib/admin/data";

export function FailedImportsTable({ initialErrors }: { initialErrors: AdminImportErrorRow[] }) {
  const [errors, setErrors] = useState(initialErrors);

  function retry(errorId: string) {
    setErrors((prev) => prev.map((e) => (e.id === errorId ? { ...e, resolved: true } : e)));
    toast.success("Item requeued for import");
  }

  function retryAll() {
    const unresolvedCount = errors.filter((e) => !e.resolved).length;
    setErrors((prev) => prev.map((e) => ({ ...e, resolved: true })));
    toast.success(`${unresolvedCount} items requeued for import`);
  }

  const columns = getFailedImportColumns({ onRetry: retry });
  const unresolvedCount = errors.filter((e) => !e.resolved).length;

  return (
    <DataTable
      columns={columns}
      data={errors}
      getRowId={(e) => e.id}
      emptyMessage="No failed imports."
      toolbar={(table) => (
        <>
          <TableSearch table={table} placeholder="Search SKU or reason..." />
          {unresolvedCount > 0 && (
            <Button variant="outline" size="sm" onClick={retryAll}>
              Retry all ({unresolvedCount})
            </Button>
          )}
        </>
      )}
    />
  );
}
