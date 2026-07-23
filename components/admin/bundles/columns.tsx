"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatMoney } from "@/lib/admin/format";
import type { AdminBundle } from "@/lib/admin/bundles";

function discountLabel(bundle: AdminBundle): string {
  return bundle.discountType === "percent" ? `${bundle.discountPercent}% off` : `${formatMoney(bundle.discountAmount ?? 0)} off`;
}

interface BundleColumnActions {
  onEdit: (bundle: AdminBundle) => void;
  onDelete: (bundle: AdminBundle) => void;
}

export function getBundleColumns({ onEdit, onDelete }: BundleColumnActions): ColumnDef<AdminBundle, unknown>[] {
  return [
    {
      id: "name",
      header: "Bundle",
      size: 260,
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{discountLabel(row.original)}</p>
        </div>
      ),
    },
    {
      id: "products",
      header: "Products",
      size: 220,
      enableSorting: false,
      accessorFn: (row) => row.products.length,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.products.slice(0, 4).map((p) => (
            <div key={p.id} className="relative h-7 w-7 shrink-0 overflow-hidden rounded border border-border bg-muted" title={p.title}>
              <Image src={p.image} alt="" fill sizes="28px" className="object-cover" />
            </div>
          ))}
          {row.original.products.length > 4 && (
            <span className="text-xs text-muted-foreground">+{row.original.products.length - 4}</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      size: 100,
      accessorFn: (row) => row.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      size: 80,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="icon-sm" aria-label="Edit" onClick={() => onEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Delete" onClick={() => onDelete(row.original)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
