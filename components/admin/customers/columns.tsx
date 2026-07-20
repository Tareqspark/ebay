"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatMoney, formatRelative } from "@/lib/admin/format";
import type { Customer } from "@/lib/admin/types";

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export const customerColumns: ColumnDef<Customer, unknown>[] = [
  {
    id: "customer",
    header: "Customer",
    size: 220,
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
          {initials(row.original.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    id: "orders",
    header: "Orders",
    size: 90,
    accessorFn: (row) => row.ordersCount,
    cell: ({ row }) => <span className="tabular-nums text-foreground">{row.original.ordersCount}</span>,
  },
  {
    id: "ltv",
    header: "Lifetime value",
    size: 130,
    accessorFn: (row) => row.lifetimeValue,
    cell: ({ row }) => <span className="tabular-nums font-medium text-foreground">{formatMoney(row.original.lifetimeValue)}</span>,
  },
  {
    id: "aov",
    header: "Avg order value",
    size: 130,
    accessorFn: (row) => row.averageOrderValue,
    cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{formatMoney(row.original.averageOrderValue)}</span>,
  },
  {
    id: "lastOrder",
    header: "Last order",
    size: 110,
    accessorFn: (row) => row.lastOrderAt ?? "",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastOrderAt ? formatRelative(row.original.lastOrderAt) : "Never"}
      </span>
    ),
  },
  {
    id: "location",
    header: "Location",
    size: 130,
    accessorFn: (row) => `${row.city}, ${row.state}`,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.city}, {row.original.state}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 100,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "notes",
    header: "Notes",
    size: 70,
    enableSorting: false,
    accessorFn: (row) => row.notes.length,
    cell: ({ row }) =>
      row.original.notes.length > 0 ? (
        <span className="text-xs text-muted-foreground">{row.original.notes.length}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];
