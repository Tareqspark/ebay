"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { selectionColumn } from "@/components/admin/table/selection-column";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { CustomerCell } from "@/components/admin/orders/order-row-cells";
import { OrderRowActions } from "@/components/admin/orders/order-row-actions";
import { formatDateTime } from "@/lib/admin/format";
import { getCustomer, getCjShippingLine } from "@/lib/admin/data";
import type { Order } from "@/lib/admin/types";

interface CjOrderColumnActions {
  onOpenDetail: (orderId: string) => void;
  onPushToCj: (orderId: string) => void;
  onMarkShipped: (orderId: string) => void;
  onCancel: (orderId: string) => void;
}

export function getCjOrderColumns(actions: CjOrderColumnActions): ColumnDef<Order, unknown>[] {
  return [
    selectionColumn<Order>(),
    {
      id: "id",
      header: "Order",
      size: 100,
      accessorFn: (row) => row.id,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.id}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      size: 180,
      accessorFn: (row) => getCustomer(row.customerId)?.name ?? row.customerId,
      cell: ({ row }) => {
        const customer = getCustomer(row.original.customerId);
        return <CustomerCell name={customer?.name ?? "—"} email={customer?.email ?? ""} />;
      },
    },
    {
      id: "items",
      header: "Items",
      size: 90,
      enableSorting: false,
      cell: ({ row }) => {
        const hasSelf = row.original.items.some((i) => i.source === "self");
        const hasCj = row.original.items.some((i) => i.source === "cj");
        return <span className="text-muted-foreground">{hasSelf && hasCj ? "Mixed" : "CJ only"}</span>;
      },
    },
    {
      id: "cjSyncStatus",
      header: "Sync status",
      size: 120,
      accessorFn: (row) => row.cjSyncStatus,
      cell: ({ row }) => <StatusBadge status={row.original.cjSyncStatus ?? "not_sent"} />,
    },
    {
      id: "cjOrderId",
      header: "CJ Order ID",
      size: 130,
      accessorFn: (row) => row.cjOrderId,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.cjOrderId ?? "—"}</span>,
    },
    {
      id: "shippingLine",
      header: "Shipping line",
      size: 190,
      enableSorting: false,
      cell: ({ row }) => {
        const line = getCjShippingLine(row.original.cjShippingLineId);
        return (
          <span className="truncate text-muted-foreground">{line ? `${line.name} (${line.estimatedDays})` : "—"}</span>
        );
      },
    },
    {
      id: "cjTracking",
      header: "CJ Tracking",
      size: 150,
      accessorFn: (row) => row.cjTrackingNumber,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.cjTrackingNumber ?? "—"}</span>,
    },
    {
      id: "date",
      header: "Placed",
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
