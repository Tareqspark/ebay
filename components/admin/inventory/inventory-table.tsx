"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { inventoryColumns } from "@/components/admin/inventory/columns";
import type { InventoryRecord } from "@/lib/admin/types";

export function InventoryTable({
  records,
  initialStatus,
}: {
  records: InventoryRecord[];
  initialStatus?: string;
}) {
  const [status, setStatus] = useState(initialStatus ?? "all");
  const [warehouse, setWarehouse] = useState("all");
  const [source, setSource] = useState("all");

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
      columns={inventoryColumns}
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
