"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { selectionColumn } from "@/components/admin/table/selection-column";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { CustomerCell, TrackingCell, CjSourceCell } from "@/components/admin/orders/order-row-cells";
import { OrderRowActions } from "@/components/admin/orders/order-row-actions";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import { getCustomer, getSupplier } from "@/lib/admin/data";
import type { Order } from "@/lib/admin/types";

interface OrderColumnActions {
  onOpenDetail: (orderId: string) => void;
  onMarkShipped: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onPushToCj: (orderId: string) => void;
}

export function getOrderColumns(actions: OrderColumnActions): ColumnDef<Order, unknown>[] {
  return [
    selectionColumn<Order>(),
    {
      id: "id",
      header: "Order",
      size: 110,
      accessorFn: (row) => row.id,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.id}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      size: 190,
      accessorFn: (row) => getCustomer(row.customerId)?.name ?? row.customerId,
      cell: ({ row }) => {
        const customer = getCustomer(row.original.customerId);
        return <CustomerCell name={customer?.name ?? "—"} email={customer?.email ?? ""} />;
      },
    },
    {
      id: "payment",
      header: "Payment",
      size: 110,
      accessorFn: (row) => row.paymentStatus,
      cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
    },
    {
      id: "fulfillment",
      header: "Fulfillment",
      size: 110,
      accessorFn: (row) => row.fulfillmentStatus,
      cell: ({ row }) => <StatusBadge status={row.original.fulfillmentStatus} />,
    },
    {
      id: "tracking",
      header: "Tracking",
      size: 170,
      enableSorting: false,
      cell: ({ row }) => {
        const hasCj = row.original.items.some((item) => item.source === "cj");
        const tracking = row.original.trackingNumber ?? (hasCj ? row.original.cjTrackingNumber : undefined);
        const carrier = row.original.trackingNumber ? row.original.carrier : hasCj ? "CJ" : undefined;
        return <TrackingCell tracking={tracking} carrier={carrier} />;
      },
    },
    {
      id: "source",
      header: "Source",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const hasSelf = row.original.items.some((item) => item.source === "self");
        const hasCj = row.original.items.some((item) => item.source === "cj");
        return <CjSourceCell hasCj={hasCj} hasSelf={hasSelf} />;
      },
    },
    {
      id: "supplier",
      header: "Supplier",
      size: 170,
      accessorFn: (row) => getSupplier(row.supplierId)?.name ?? row.supplierId,
      cell: ({ row }) => (
        <span className="truncate text-muted-foreground">{getSupplier(row.original.supplierId)?.name ?? "—"}</span>
      ),
    },
    {
      id: "total",
      header: "Total",
      size: 100,
      accessorFn: (row) => row.total,
      cell: ({ row }) => <span className="tabular-nums text-foreground">{formatMoney(row.original.total)}</span>,
    },
    {
      id: "date",
      header: "Date",
      size: 150,
      accessorFn: (row) => row.placedAt,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDateTime(row.original.placedAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      size: 44,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      cell: ({ row }) => (
        <OrderRowActions
          order={row.original}
          onOpenDetail={() => actions.onOpenDetail(row.original.id)}
          onMarkShipped={() => actions.onMarkShipped(row.original.id)}
          onCancel={() => actions.onCancel(row.original.id)}
          onPushToCj={() => actions.onPushToCj(row.original.id)}
        />
      ),
    },
  ];
}
