"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { Button } from "@/components/ui/button";
import { getCjOrderColumns } from "@/components/admin/cj/cj-order-columns";
import { OrderDetailPanel } from "@/components/admin/orders/order-detail-panel";
import type { CjSyncStatus, FulfillmentStatus, Order } from "@/lib/admin/types";

interface CjOrdersTableProps {
  initialOrders: Order[];
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

  const patchOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)));
  }, []);

  const pushToCj = useCallback(
    (id: string) =>
      patchOrder(id, {
        cjSyncStatus: "queued" as CjSyncStatus,
        cjOrderId: `CJO-${Math.floor(Math.random() * 9000000 + 1000000)}`,
      }),
    [patchOrder]
  );
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

  const columns = useMemo(
    () =>
      getCjOrderColumns({
        onOpenDetail: (id) => {
          setDetailOrderId(id);
          setDetailOpen(true);
        },
        onPushToCj: (id) => {
          pushToCj(id);
          toast.success(`${id} pushed to CJ`);
        },
        onMarkShipped: (id) => {
          markShipped(id);
          toast.success(`${id} marked as shipped`);
        },
        onCancel: (id) => {
          cancelOrder(id);
          toast.success(`${id} cancelled`);
        },
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
                toast.success(`${selectedIds.length} orders pushed to CJ`);
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
