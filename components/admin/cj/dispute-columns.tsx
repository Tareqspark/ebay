"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { getCustomer } from "@/lib/admin/data";
import type { CjDispute } from "@/lib/admin/cj-types";

const REASON_LABEL: Record<string, string> = {
  lost_in_transit: "Lost in transit",
  damaged: "Damaged",
  wrong_item: "Wrong item",
  not_as_described: "Not as described",
  defective: "Defective",
};

const RESOLUTION_LABEL: Record<string, string> = {
  reshipment: "Reshipment",
  refund: "Refund",
};

interface DisputeColumnActions {
  onResolve: (id: string, status: "resolved_reship" | "resolved_refund") => void;
  onReject: (id: string) => void;
}

export function getDisputeColumns({ onResolve, onReject }: DisputeColumnActions): ColumnDef<CjDispute, unknown>[] {
  return [
    {
      id: "order",
      header: "Order",
      size: 100,
      accessorFn: (row) => row.orderId,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.orderId}</span>,
    },
    {
      id: "product",
      header: "Product",
      size: 220,
      accessorFn: (row) => row.productTitle,
      cell: ({ row }) => <span className="truncate text-foreground">{row.original.productTitle}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      size: 150,
      accessorFn: (row) => getCustomer(row.customerId)?.name ?? row.customerId,
      cell: ({ row }) => <span className="text-muted-foreground">{getCustomer(row.original.customerId)?.name ?? "—"}</span>,
    },
    {
      id: "reason",
      header: "Reason",
      size: 140,
      accessorFn: (row) => row.reason,
      cell: ({ row }) => <span className="text-muted-foreground">{REASON_LABEL[row.original.reason]}</span>,
    },
    {
      id: "resolution",
      header: "Requested",
      size: 110,
      accessorFn: (row) => row.requestedResolution,
      cell: ({ row }) => <span className="text-muted-foreground">{RESOLUTION_LABEL[row.original.requestedResolution]}</span>,
    },
    {
      id: "amount",
      header: "Amount",
      size: 100,
      accessorFn: (row) => row.amount,
      cell: ({ row }) => <span className="tabular-nums text-foreground">{formatMoney(row.original.amount)}</span>,
    },
    {
      id: "status",
      header: "Status",
      size: 160,
      accessorFn: (row) => row.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "date",
      header: "Filed",
      size: 100,
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      size: 100,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) =>
        ["open", "awaiting_cj"].includes(row.original.status) && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Resolve"
              onClick={() => onResolve(row.original.id, row.original.requestedResolution === "reshipment" ? "resolved_reship" : "resolved_refund")}
            >
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
