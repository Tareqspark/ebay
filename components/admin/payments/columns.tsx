"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import { getCustomer } from "@/lib/admin/data";
import type { Dispute, Payment, Payout } from "@/lib/admin/types";

export const paymentColumns: ColumnDef<Payment, unknown>[] = [
  {
    id: "id",
    header: "Payment",
    size: 130,
    accessorFn: (row) => row.id,
    cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.id}</span>,
  },
  {
    id: "order",
    header: "Order",
    size: 110,
    accessorFn: (row) => row.orderId,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.orderId}</span>,
  },
  {
    id: "customer",
    header: "Customer",
    size: 180,
    accessorFn: (row) => getCustomer(row.customerId)?.name ?? row.customerId,
    cell: ({ row }) => <span className="text-muted-foreground">{getCustomer(row.original.customerId)?.name ?? "—"}</span>,
  },
  {
    id: "amount",
    header: "Amount",
    size: 100,
    accessorFn: (row) => row.amount,
    cell: ({ row }) => <span className="tabular-nums font-medium text-foreground">{formatMoney(row.original.amount)}</span>,
  },
  {
    id: "fee",
    header: "Processor fee",
    size: 110,
    accessorFn: (row) => row.processorFee,
    cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{formatMoney(row.original.processorFee)}</span>,
  },
  {
    id: "method",
    header: "Method",
    size: 170,
    accessorFn: (row) => row.method,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.method}</span>,
  },
  {
    id: "date",
    header: "Date",
    size: 150,
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>,
  },
];

export const disputeColumns: ColumnDef<Dispute, unknown>[] = [
  {
    id: "order",
    header: "Order",
    size: 110,
    accessorFn: (row) => row.orderId,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.orderId}</span>,
  },
  {
    id: "customer",
    header: "Customer",
    size: 180,
    accessorFn: (row) => getCustomer(row.customerId)?.name ?? row.customerId,
    cell: ({ row }) => <span className="text-muted-foreground">{getCustomer(row.original.customerId)?.name ?? "—"}</span>,
  },
  {
    id: "reason",
    header: "Reason",
    size: 220,
    accessorFn: (row) => row.reason,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.reason}</span>,
  },
  {
    id: "amount",
    header: "Amount",
    size: 100,
    accessorFn: (row) => row.amount,
    cell: ({ row }) => <span className="tabular-nums font-medium text-foreground">{formatMoney(row.original.amount)}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 130,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "dueBy",
    header: "Respond by",
    size: 140,
    accessorFn: (row) => row.dueBy,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDateTime(row.original.dueBy)}</span>,
  },
];

export const payoutColumns: ColumnDef<Payout, unknown>[] = [
  {
    id: "id",
    header: "Payout",
    size: 110,
    accessorFn: (row) => row.id,
    cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.id}</span>,
  },
  {
    id: "period",
    header: "Period",
    size: 220,
    accessorFn: (row) => row.periodStart,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDateTime(row.original.periodStart)} – {formatDateTime(row.original.periodEnd)}
      </span>
    ),
  },
  {
    id: "transactions",
    header: "Transactions",
    size: 110,
    accessorFn: (row) => row.transactionCount,
    cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{row.original.transactionCount.toLocaleString()}</span>,
  },
  {
    id: "amount",
    header: "Amount",
    size: 110,
    accessorFn: (row) => row.amount,
    cell: ({ row }) => <span className="tabular-nums font-medium text-foreground">{formatMoney(row.original.amount)}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 110,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "arrival",
    header: "Arrival",
    size: 130,
    accessorFn: (row) => row.arrivalDate,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDateTime(row.original.arrivalDate)}</span>,
  },
];
