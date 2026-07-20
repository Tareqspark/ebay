"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { Button } from "@/components/ui/button";
import { getOrderColumns } from "@/components/admin/orders/columns";
import { OrderDetailPanel } from "@/components/admin/orders/order-detail-panel";
import type { Order, FulfillmentStatus, CjSyncStatus } from "@/lib/admin/types";

interface OrdersTableProps {
  initialOrders: Order[];
  initialStatusFilter?: string;
  initialQuery?: string;
}

export function OrdersTable({ initialOrders, initialStatusFilter, initialQuery }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [fulfillment, setFulfillment] = useState(initialStatusFilter ?? "all");
  const [payment, setPayment] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  const ordersById = useMemo(() => new Map(orders.map((o) => [o.id, o])), [orders]);
  const detailOrder = detailOrderId ? ordersById.get(detailOrderId) ?? null : null;

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (fulfillment !== "all" && o.fulfillmentStatus !== fulfillment) return false;
        if (payment !== "all" && o.paymentStatus !== payment) return false;
        return true;
      }),
    [orders, fulfillment, payment]
  );

  const patchOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)));
  }, []);

  const markShipped = useCallback(
    (id: string) =>
      patchOrder(id, {
        fulfillmentStatus: "shipped" as FulfillmentStatus,
        trackingNumber: `1Z${Math.floor(Math.random() * 900000000 + 100000000)}US`,
        carrier: "UPS",
      }),
    [patchOrder]
  );
  const cancelOrder = useCallback(
    (id: string) => patchOrder(id, { fulfillmentStatus: "cancelled" as FulfillmentStatus }),
    [patchOrder]
  );
  const refundOrder = useCallback((id: string) => patchOrder(id, { paymentStatus: "refunded" }), [patchOrder]);
  const pushToCj = useCallback(
    (id: string) => patchOrder(id, { cjSyncStatus: "queued" as CjSyncStatus, cjOrderId: `CJO-${Math.floor(Math.random() * 9000000 + 1000000)}` }),
    [patchOrder]
  );

  const columns = useMemo(
    () =>
      getOrderColumns({
        onOpenDetail: (id) => {
          setDetailOrderId(id);
          setDetailOpen(true);
        },
        onMarkShipped: (id) => {
          markShipped(id);
          toast.success(`${id} marked as shipped`);
        },
        onCancel: (id) => {
          cancelOrder(id);
          toast.success(`${id} cancelled`);
        },
        onPushToCj: (id) => {
          pushToCj(id);
          toast.success(`${id} pushed to CJdropshipping`);
        },
      }),
    [markShipped, cancelOrder, pushToCj]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        enableSelection
        getRowId={(o) => o.id}
        onRowClick={(o) => {
          setDetailOrderId(o.id);
          setDetailOpen(true);
        }}
        emptyMessage="No orders match these filters."
        initialGlobalFilter={initialQuery}
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search order # or search from ⌘K..." />
            <FilterSelect
              value={fulfillment}
              onChange={setFulfillment}
              allLabel="All fulfillment"
              options={[
                { value: "unfulfilled", label: "Unfulfilled" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
            <FilterSelect
              value={payment}
              onChange={setPayment}
              allLabel="All payments"
              options={[
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "refunded", label: "Refunded" },
                { value: "partially_refunded", label: "Partial refund" },
                { value: "failed", label: "Failed" },
              ]}
            />
          </>
        )}
        bulkActions={(table) => {
          const selectedIds = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectedIds.forEach(markShipped);
                toast.success(`${selectedIds.length} orders marked as shipped`);
                table.resetRowSelection();
              }}
            >
              Mark as shipped
            </Button>
          );
        }}
      />

      <OrderDetailPanel
        open={detailOpen}
        order={detailOrder}
        onOpenChange={setDetailOpen}
        onMarkShipped={markShipped}
        onRefund={refundOrder}
        onCancel={cancelOrder}
        onPushToCj={pushToCj}
      />
    </>
  );
}
