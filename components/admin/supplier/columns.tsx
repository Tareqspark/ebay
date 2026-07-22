"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDateTime, formatNumber, formatRelative } from "@/lib/admin/format";
import type { AdminImportErrorRow, AdminImportJobRow } from "@/lib/admin/data";
import type { Supplier } from "@/lib/admin/types";

export const supplierColumns: ColumnDef<Supplier, unknown>[] = [
  {
    id: "name",
    header: "Supplier",
    size: 200,
    accessorFn: (row) => row.name,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
  },
  {
    id: "region",
    header: "Region",
    size: 110,
    accessorFn: (row) => row.region,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.region}</span>,
  },
  {
    id: "integration",
    header: "Integration",
    size: 110,
    accessorFn: (row) => row.integration,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.integration}</span>,
  },
  {
    id: "products",
    header: "Products",
    size: 100,
    accessorFn: (row) => row.productsSupplied,
    cell: ({ row }) => <span className="tabular-nums text-foreground">{formatNumber(row.original.productsSupplied)}</span>,
  },
  {
    id: "fulfillment",
    header: "Avg fulfillment",
    size: 120,
    accessorFn: (row) => row.avgFulfillmentDays,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.avgFulfillmentDays} days</span>,
  },
  {
    id: "rating",
    header: "Rating",
    size: 90,
    accessorFn: (row) => row.rating,
    cell: ({ row }) => <span className="tabular-nums text-foreground">{row.original.rating.toFixed(1)}</span>,
  },
  {
    id: "sync",
    header: "Last sync",
    size: 110,
    accessorFn: (row) => row.lastSyncAt,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelative(row.original.lastSyncAt)}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 100,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export const importHistoryColumns: ColumnDef<AdminImportJobRow, unknown>[] = [
  {
    id: "id",
    header: "Job",
    size: 100,
    accessorFn: (row) => row.id,
    cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.id}</span>,
  },
  {
    id: "supplier",
    header: "Supplier",
    size: 180,
    accessorFn: (row) => row.supplierName,
    cell: ({ row }) => <span className="text-foreground">{row.original.supplierName}</span>,
  },
  {
    id: "type",
    header: "Type",
    size: 130,
    accessorFn: (row) => row.type,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.type.replace(/_/g, " ")}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 100,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "items",
    header: "Items",
    size: 150,
    accessorFn: (row) => row.totalItems,
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {formatNumber(row.original.processedItems)} / {formatNumber(row.original.totalItems)}
        {row.original.failedItems > 0 && (
          <span className="ml-1.5 text-red-600 dark:text-red-400">({row.original.failedItems} failed)</span>
        )}
      </span>
    ),
  },
  {
    id: "started",
    header: "Started",
    size: 150,
    accessorFn: (row) => row.startedAt ?? "",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.startedAt ? formatDateTime(row.original.startedAt) : "—"}</span>
    ),
  },
  {
    id: "completed",
    header: "Completed",
    size: 150,
    accessorFn: (row) => row.completedAt ?? "",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.completedAt ? formatDateTime(row.original.completedAt) : "—"}</span>
    ),
  },
];

interface FailedImportColumnActions {
  onRetry: (errorId: string) => void;
}

export function getFailedImportColumns({ onRetry }: FailedImportColumnActions): ColumnDef<AdminImportErrorRow, unknown>[] {
  return [
    {
      id: "sku",
      header: "SKU",
      size: 130,
      accessorFn: (row) => row.sku,
      cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.sku}</span>,
    },
    {
      id: "supplier",
      header: "Supplier",
      size: 180,
      accessorFn: (row) => row.supplierName,
      cell: ({ row }) => <span className="text-foreground">{row.original.supplierName}</span>,
    },
    {
      id: "reason",
      header: "Reason",
      size: 260,
      accessorFn: (row) => row.reason,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.reason}</span>,
    },
    {
      id: "occurred",
      header: "Occurred",
      size: 140,
      accessorFn: (row) => row.occurredAt ?? "",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.occurredAt ? formatRelative(row.original.occurredAt) : "—"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      size: 110,
      accessorFn: (row) => (row.resolved ? "resolved" : "unresolved"),
      cell: ({ row }) => (
        <StatusBadge status={row.original.resolved ? "completed" : "needs_response"} />
      ),
    },
    {
      id: "actions",
      header: "",
      size: 100,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) =>
        !row.original.resolved && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onRetry(row.original.id);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </Button>
        ),
    },
  ];
}
