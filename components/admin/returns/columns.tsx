"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate, formatMoney } from "@/lib/admin/format";
import type { AdminReturn } from "@/lib/admin/returns";

const REASON_LABEL: Record<string, string> = {
  defective: "Defective",
  wrong_item: "Wrong item",
  not_as_described: "Not as described",
  no_longer_needed: "No longer needed",
  damaged_in_shipping: "Arrived damaged",
  other: "Other",
};

interface ReturnColumnActions {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function getReturnColumns({ onApprove, onReject }: ReturnColumnActions): ColumnDef<AdminReturn, unknown>[] {
  return [
    {
      id: "order",
      header: "Order",
      size: 110,
      accessorFn: (row) => row.orderNumber,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.orderNumber}</span>,
    },
    {
      id: "product",
      header: "Product",
      size: 220,
      accessorFn: (row) => row.productTitle,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-foreground">{row.original.productTitle}</p>
          <p className="text-xs text-muted-foreground">Qty {row.original.quantity}</p>
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      size: 160,
      accessorFn: (row) => row.customerName,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-foreground">{row.original.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.customerEmail}</p>
        </div>
      ),
    },
    {
      id: "reason",
      header: "Reason",
      size: 150,
      accessorFn: (row) => row.reason,
      cell: ({ row }) => <span className="text-muted-foreground">{REASON_LABEL[row.original.reason]}</span>,
    },
    {
      id: "refund",
      header: "Refund",
      size: 100,
      accessorFn: (row) => row.refundAmount,
      cell: ({ row }) => <span className="tabular-nums text-foreground">{formatMoney(row.original.refundAmount)}</span>,
    },
    {
      id: "status",
      header: "Status",
      size: 110,
      accessorFn: (row) => row.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "date",
      header: "Requested",
      size: 100,
      accessorFn: (row) => row.requestedAt,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.requestedAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      size: 90,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      cell: ({ row }) =>
        row.original.status === "requested" && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="icon-sm" aria-label="Approve and refund" onClick={() => onApprove(row.original.id)}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Reject" onClick={() => onReject(row.original.id)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
    },
  ];
}
