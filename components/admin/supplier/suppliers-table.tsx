"use client";

import { DataTable } from "@/components/admin/table/data-table";
import { supplierColumns } from "@/components/admin/supplier/columns";
import type { Supplier } from "@/lib/admin/types";

export function SuppliersTable({ suppliers }: { suppliers: Supplier[] }) {
  return <DataTable columns={supplierColumns} data={suppliers} getRowId={(s) => s.id} pageSize={20} />;
}
