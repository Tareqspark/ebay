"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate } from "@/lib/admin/format";
import type { Collection } from "@/lib/admin/collections";

export const collectionColumns: ColumnDef<Collection, unknown>[] = [
  {
    id: "name",
    header: "Collection",
    size: 260,
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <Image src={`https://picsum.photos/seed/${row.original.imageSeed}/80/80`} alt="" fill sizes="36px" className="object-cover" />
        </div>
        <span className="font-medium text-foreground">{row.original.name}</span>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    size: 110,
    accessorFn: (row) => row.type,
    cell: ({ row }) => (
      <span className="capitalize text-muted-foreground">{row.original.type}</span>
    ),
  },
  {
    id: "rule",
    header: "Rule",
    size: 260,
    enableSorting: false,
    accessorFn: (row) => row.ruleDescription ?? "",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.ruleDescription ?? "Manually curated"}</span>
    ),
  },
  {
    id: "count",
    header: "Products",
    size: 100,
    accessorFn: (row) => row.productCount,
    cell: ({ row }) => <span className="tabular-nums text-foreground">{row.original.productCount.toLocaleString()}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 100,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "updated",
    header: "Last updated",
    size: 120,
    accessorFn: (row) => row.updatedAt,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span>,
  },
];
