"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/table/data-table";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatMoney } from "@/lib/admin/format";
import type { ShippingRate } from "@/lib/admin/shipping";

const columns: ColumnDef<ShippingRate, unknown>[] = [
  { id: "zone", header: "Zone", size: 160, accessorFn: (r) => r.zone, cell: ({ row }) => <span className="font-medium text-foreground">{row.original.zone}</span> },
  { id: "method", header: "Method", size: 170, accessorFn: (r) => r.method, cell: ({ row }) => <span className="text-foreground">{row.original.method}</span> },
  { id: "condition", header: "Condition", size: 160, accessorFn: (r) => r.condition, cell: ({ row }) => <span className="text-muted-foreground">{row.original.condition}</span> },
  { id: "rate", header: "Rate", size: 100, accessorFn: (r) => r.rate, cell: ({ row }) => <span className="tabular-nums text-foreground">{row.original.rate === 0 ? "Free" : formatMoney(row.original.rate)}</span> },
  { id: "estimate", header: "Delivery estimate", size: 180, accessorFn: (r) => r.deliveryEstimate, cell: ({ row }) => <span className="text-muted-foreground">{row.original.deliveryEstimate}</span> },
  { id: "status", header: "Status", size: 100, accessorFn: (r) => r.status, cell: ({ row }) => <StatusBadge status={row.original.status === "active" ? "active" : "archived"} /> },
];

export function ShippingRatesTable({ rates }: { rates: ShippingRate[] }) {
  return <DataTable columns={columns} data={rates} getRowId={(r) => r.id} pageSize={20} />;
}
