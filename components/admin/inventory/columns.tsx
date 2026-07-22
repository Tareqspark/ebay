"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatRelative } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { AdminInventoryRow } from "@/lib/admin/data";

export const inventoryColumns: ColumnDef<AdminInventoryRow, unknown>[] = [
  {
    id: "sku",
    header: "SKU",
    size: 220,
    accessorFn: (row) => row.sku,
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <Image src={row.original.image} alt="" fill sizes="32px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.sku}</p>
        </div>
      </div>
    ),
  },
  {
    id: "warehouse",
    header: "Warehouse",
    size: 140,
    accessorFn: (row) => row.warehouse,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.warehouse}</span>,
  },
  {
    id: "available",
    header: "Available",
    size: 100,
    accessorFn: (row) => row.available,
    cell: ({ row }) => (
      <span className={cn("tabular-nums", row.original.available === 0 && "font-medium text-red-600 dark:text-red-400")}>
        {row.original.available.toLocaleString()}
      </span>
    ),
  },
  {
    id: "reserved",
    header: "Reserved",
    size: 100,
    accessorFn: (row) => row.reserved,
    cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.reserved.toLocaleString()}</span>,
  },
  {
    id: "incoming",
    header: "Incoming",
    size: 100,
    accessorFn: (row) => row.incoming,
    cell: ({ row }) =>
      row.original.incoming > 0 ? (
        <span className="tabular-nums text-emerald-600 dark:text-emerald-400">+{row.original.incoming.toLocaleString()}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "status",
    header: "Status",
    size: 110,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "source",
    header: "Source",
    size: 70,
    accessorFn: (row) => row.source,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.source === "cj" ? "CJ" : "Self"}</span>,
  },
  {
    id: "supplier",
    header: "Supplier",
    size: 170,
    accessorFn: (row) => row.supplierName ?? row.supplierId,
    cell: ({ row }) => <span className="truncate text-muted-foreground">{row.original.supplierName ?? "—"}</span>,
  },
  {
    id: "updated",
    header: "Updated",
    size: 100,
    accessorFn: (row) => row.updatedAt,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelative(row.original.updatedAt)}</span>,
  },
];
