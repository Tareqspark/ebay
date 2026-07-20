"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { customerColumns } from "@/components/admin/customers/columns";
import { CustomerDetailPanel } from "@/components/admin/customers/customer-detail-panel";
import type { Customer, CustomerNote } from "@/lib/admin/types";

export function CustomersTable({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [status, setStatus] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const customersById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const detailCustomer = detailId ? customersById.get(detailId) ?? null : null;

  const filtered = useMemo(
    () => customers.filter((c) => status === "all" || c.status === status),
    [customers, status]
  );

  function addNote(customerId: string, note: CustomerNote) {
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, notes: [note, ...c.notes] } : c)));
  }

  return (
    <>
      <DataTable
        columns={customerColumns}
        data={filtered}
        getRowId={(c) => c.id}
        emptyMessage="No customers match these filters."
        onRowClick={(c) => {
          setDetailId(c.id);
          setDetailOpen(true);
        }}
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search name or email..." />
            <FilterSelect
              value={status}
              onChange={setStatus}
              allLabel="All statuses"
              options={[
                { value: "active", label: "Active" },
                { value: "vip", label: "VIP" },
                { value: "at-risk", label: "At risk" },
                { value: "blocked", label: "Blocked" },
              ]}
            />
          </>
        )}
      />
      <CustomerDetailPanel open={detailOpen} customer={detailCustomer} onOpenChange={setDetailOpen} onAddNote={addNote} />
    </>
  );
}
