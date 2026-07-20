"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { selectionColumn } from "@/components/admin/table/selection-column";
import { EditableMoneyCell } from "@/components/admin/table/editable-cell";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { ProductCell } from "@/components/admin/products/product-cell";
import { ProductRowActions } from "@/components/admin/products/product-row-actions";
import { formatRelative } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { AdminProductRow } from "@/lib/admin/data";

interface ColumnActions {
  onEditPrice: (productId: string, price: number) => void;
  onEditCost: (productId: string, cost: number) => void;
  onOpenDetail: (productId: string) => void;
  onDuplicate: (productId: string) => void;
  onToggleArchive: (productId: string) => void;
}

function marginClass(pct: number): string {
  if (pct >= 30) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 15) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function getProductColumns(actions: ColumnActions): ColumnDef<AdminProductRow, unknown>[] {
  return [
    selectionColumn<AdminProductRow>(),
    {
      id: "product",
      header: "Product",
      size: 280,
      accessorFn: (row) => row.product.title,
      cell: ({ row }) => (
        <ProductCell
          image={row.original.product.images[0]}
          title={row.original.product.title}
          brandName={row.original.brandName}
        />
      ),
    },
    {
      id: "category",
      header: "Category",
      size: 150,
      accessorFn: (row) => row.categoryName,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.categoryName}</span>,
    },
    {
      id: "price",
      header: "Price",
      size: 100,
      accessorFn: (row) => row.product.price,
      cell: ({ row }) => (
        <EditableMoneyCell
          value={row.original.product.price}
          onCommit={(next) => actions.onEditPrice(row.original.product.id, next)}
        />
      ),
    },
    {
      id: "cost",
      header: "Cost",
      size: 100,
      accessorFn: (row) => row.meta.cost,
      cell: ({ row }) => (
        <EditableMoneyCell
          value={row.original.meta.cost}
          onCommit={(next) => actions.onEditCost(row.original.product.id, next)}
        />
      ),
    },
    {
      id: "margin",
      header: "Margin",
      size: 90,
      accessorFn: (row) => row.marginPercent,
      cell: ({ row }) => (
        <span className={cn("font-medium tabular-nums", marginClass(row.original.marginPercent))}>
          {row.original.marginPercent.toFixed(1)}%
        </span>
      ),
    },
    {
      id: "inventory",
      header: "Inventory",
      size: 90,
      accessorFn: (row) => row.product.stock,
      cell: ({ row }) => {
        const stock = row.original.product.stock;
        return (
          <span className={cn("tabular-nums", stock === 0 && "font-medium text-red-600 dark:text-red-400")}>
            {stock.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "source",
      header: "Source",
      size: 70,
      accessorFn: (row) => row.meta.source,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.meta.source === "cj" ? "CJ" : "Self"}</span>
      ),
    },
    {
      id: "supplier",
      header: "Supplier",
      size: 170,
      accessorFn: (row) => row.supplierName,
      cell: ({ row }) => <span className="truncate text-muted-foreground">{row.original.supplierName}</span>,
    },
    {
      id: "visibility",
      header: "Visibility",
      size: 100,
      accessorFn: (row) => row.meta.visibility,
      cell: ({ row }) => <StatusBadge status={row.original.meta.visibility} />,
    },
    {
      id: "status",
      header: "Status",
      size: 100,
      accessorFn: (row) => row.meta.status,
      cell: ({ row }) => <StatusBadge status={row.original.meta.status} />,
    },
    {
      id: "updated",
      header: "Last updated",
      size: 120,
      accessorFn: (row) => row.meta.lastUpdatedAt,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatRelative(row.original.meta.lastUpdatedAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 44,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      cell: ({ row }) => (
        <ProductRowActions
          row={row.original}
          onOpenDetail={() => actions.onOpenDetail(row.original.product.id)}
          onDuplicate={() => actions.onDuplicate(row.original.product.id)}
          onToggleArchive={() => actions.onToggleArchive(row.original.product.id)}
        />
      ),
    },
  ];
}
