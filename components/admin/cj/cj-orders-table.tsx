"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { Button } from "@/components/ui/button";
import { getCjOrderColumns } from "@/components/admin/cj/cj-order-columns";
import { OrderDetailPanel } from "@/components/admin/orders/order-detail-panel";
import {
  markOrderShippedAction,
  cancelOrderAction,
  refundOrderAction,
  pushOrderToCjAction,
} from "@/lib/admin/order-actions";
import type { AdminOrderRow } from "@/lib/admin/data";
import type { CjSyncStatus, FulfillmentStatus } from "@/lib/admin/types";

interface CjOrdersTableProps {
  initialOrders: AdminOrderRow[];
}

export function CjOrdersTable({ initialOrders }: CjOrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [syncStatus, setSyncStatus] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  const ordersById = useMemo(() => new Map(orders.map((o) => [o.id, o])), [orders]);
  const detailOrder = detailOrderId ? ordersById.get(detailOrderId) ?? null : null;

  const filtered = useMemo(
    () => orders.filter((o) => syncStatus === "all" || o.cjSyncStatus === syncStatus),
    [orders, syncStatus]
  );

  const patchOrder = useCallback((id: string, patch: Partial<AdminOrderRow>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)));
  }, []);

  const pushToCj = useCallback(
    async (id: string) => {
      const order = ordersById.get(id);
      if (!order) return;
      const result = await pushOrderToCjAction(id, order.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      patchOrder(id, { cjSyncStatus: "queued" as CjSyncStatus, cjOrderId: `CJO-${Math.floor(Math.random() * 9000000 + 1000000)}` });
      toast.success(`${order.id} pushed to CJ`);
    },
    [patchOrder, ordersById]
  );
  const markShipped = useCallback(
    async (id: string) => {
      const order = ordersById.get(id);
      if (!order) return;
      const result = await markOrderShippedAction(id, order.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      patchOrder(id, {
        fulfillmentStatus: "shipped" as FulfillmentStatus,
        trackingNumber: `1Z${Math.floor(Math.random() * 900000000 + 100000000)}US`,
        carrier: "UPS",
      });
      toast.success(`${order.id} marked as shipped`);
    },
    [patchOrder, ordersById]
  );
  const cancelOrder = useCallback(
    async (id: string) => {
      const order = ordersById.get(id);
      if (!order) return;
      const result = await cancelOrderAction(id, order.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      patchOrder(id, { fulfillmentStatus: "cancelled" as FulfillmentStatus });
      toast.success(`${order.id} cancelled`);
    },
    [patchOrder, ordersById]
  );
  const refundOrder = useCallback(
    async (id: string) => {
      const order = ordersById.get(id);
      if (!order) return;
      const result = await refundOrderAction(id, order.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      patchOrder(id, { paymentStatus: "refunded" });
      toast.success(`${order.id} refunded`);
    },
    [patchOrder, ordersById]
  );

  const columns = useMemo(
    () =>
      getCjOrderColumns({
        onOpenDetail: (id) => {
          setDetailOrderId(id);
          setDetailOpen(true);
        },
        onPushToCj: pushToCj,
        onMarkShipped: markShipped,
        onCancel: cancelOrder,
      }),
    [pushToCj, markShipped, cancelOrder]
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
        emptyMessage="No CJ orders match these filters."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search order # or customer..." />
            <FilterSelect
              value={syncStatus}
              onChange={setSyncStatus}
              allLabel="All sync statuses"
              options={[
                { value: "not_sent", label: "Not sent" },
                { value: "queued", label: "Queued" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
              ]}
            />
          </>
        )}
        bulkActions={(table) => {
          const selectedIds = table
            .getFilteredSelectedRowModel()
            .rows.map((r) => r.original)
            .filter((o) => o.cjSyncStatus === "not_sent")
            .map((o) => o.id);
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => {
                selectedIds.forEach(pushToCj);
                table.resetRowSelection();
              }}
            >
              Push to CJ
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
