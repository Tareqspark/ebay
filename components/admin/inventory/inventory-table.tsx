"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { getInventoryColumns } from "@/components/admin/inventory/columns";
import { adjustInventoryAction } from "@/lib/admin/inventory-actions";
import type { AdminInventoryRow } from "@/lib/admin/data";

export function InventoryTable({
  records: initialRecords,
  initialStatus,
}: {
  records: AdminInventoryRow[];
  initialStatus?: string;
}) {
  const [records, setRecords] = useState(initialRecords);
  const [status, setStatus] = useState(initialStatus ?? "all");
  const [warehouse, setWarehouse] = useState("all");
  const [source, setSource] = useState("all");

  const onAdjust = useCallback(async (sku: string, nextAvailable: number) => {
    const result = await adjustInventoryAction(sku, nextAvailable);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setRecords((prev) => prev.map((r) => (r.sku === sku ? { ...r, available: nextAvailable } : r)));
    toast.success(`Stock updated to ${nextAvailable.toLocaleString()} units`);
  }, []);

  const columns = useMemo(() => getInventoryColumns({ onAdjust }), [onAdjust]);

  const warehouseOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.warehouse))).sort().map((w) => ({ value: w, label: w })),
    [records]
  );

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (warehouse !== "all" && r.warehouse !== warehouse) return false;
        if (source !== "all" && r.source !== source) return false;
        return true;
      }),
    [records, status, warehouse, source]
  );

  return (
    <DataTable
      columns={columns}
      data={filtered}
      getRowId={(r) => r.sku}
      emptyMessage="No inventory records match these filters."
      toolbar={(table) => (
        <>
          <TableSearch table={table} placeholder="Search SKU or product..." />
          <FilterSelect
            value={status}
            onChange={setStatus}
            allLabel="All statuses"
            options={[
              { value: "in_stock", label: "In stock" },
              { value: "low_stock", label: "Low stock" },
              { value: "backorder", label: "Backorder" },
              { value: "out_of_stock", label: "Out of stock" },
            ]}
          />
          <FilterSelect
            value={warehouse}
            onChange={setWarehouse}
            allLabel="All warehouses"
            width="w-[180px]"
            options={warehouseOptions}
          />
          <FilterSelect
            value={source}
            onChange={setSource}
            allLabel="All sources"
            options={[
              { value: "self", label: "Self-stocked" },
              { value: "cj", label: "CJ dropship" },
            ]}
          />
        </>
      )}
    />
  );
}
