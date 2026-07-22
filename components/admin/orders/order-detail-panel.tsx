"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Ban, PackageCheck, RotateCcw, Send } from "lucide-react";
import { SlideOver } from "@/components/admin/shared/slide-over";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import { CJ_BRAND_NAME } from "@/lib/admin/data";
import type { AdminOrderRow } from "@/lib/admin/data";

interface OrderDetailPanelProps {
  open: boolean;
  order: AdminOrderRow | null;
  onOpenChange: (open: boolean) => void;
  onMarkShipped: (orderId: string) => void;
  onRefund: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onPushToCj: (orderId: string) => void;
}

export function OrderDetailPanel({
  open,
  order,
  onOpenChange,
  onMarkShipped,
  onRefund,
  onCancel,
  onPushToCj,
}: OrderDetailPanelProps) {
  if (!order) {
    return (
      <SlideOver open={open} onOpenChange={onOpenChange} title="Order details" wide>
        {null}
      </SlideOver>
    );
  }

  const hasSelfItems = order.items.some((item) => item.source === "self");
  const hasCjItems = order.items.some((item) => item.source === "cj");
  const canShip = hasSelfItems && (order.fulfillmentStatus === "unfulfilled" || order.fulfillmentStatus === "processing");
  const canPushToCj = hasCjItems && order.cjSyncStatus === "not_sent";
  const canRefund = order.paymentStatus === "paid";
  const canCancel = !["delivered", "cancelled"].includes(order.fulfillmentStatus);

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      wide
      title={
        <div className="flex items-center gap-2">
          <span>{order.id}</span>
          <StatusBadge status={order.paymentStatus} />
          <StatusBadge status={order.fulfillmentStatus} />
        </div>
      }
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onCancel(order.id);
                toast.success(`${order.id} cancelled`);
              }}
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel order
            </Button>
          )}
          {canRefund && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onRefund(order.id);
                toast.success(`${order.id} refunded`);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Issue refund
            </Button>
          )}
          {canPushToCj && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onPushToCj(order.id);
                toast.success(`${order.id} pushed to ${CJ_BRAND_NAME}`);
              }}
            >
              <Send className="h-3.5 w-3.5" />
              Push to CJ
            </Button>
          )}
          {canShip && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onMarkShipped(order.id);
                toast.success(`${order.id} marked as shipped`);
              }}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Mark as shipped
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</h3>
          <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
            {order.items.map((item, i) => (
              <div key={`${item.productId}-${i}`} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity} × {formatMoney(item.price)}
                  </p>
                </div>
                <p className="shrink-0 text-sm tabular-nums text-foreground">{formatMoney(item.price * item.quantity)}</p>
              </div>
            ))}
            <Separator />
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="tabular-nums">{order.shipping === 0 ? "Free" : formatMoney(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="tabular-nums">{formatMoney(order.tax)}</span>
              </div>
              <div className="flex justify-between font-medium text-foreground">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <InfoCard title="Customer">
            <p className="font-medium text-foreground">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerEmail}</p>
          </InfoCard>
          <InfoCard title="Payment">
            <p className="text-foreground">{order.paymentMethod}</p>
            <p className="text-muted-foreground">{formatDateTime(order.placedAt)}</p>
          </InfoCard>
          <InfoCard title="Shipping address">
            <p className="text-foreground">{order.shippingAddress.name}</p>
            <p className="text-muted-foreground">
              {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zip}
            </p>
          </InfoCard>
          {hasSelfItems && (
            <InfoCard title="Fulfillment — self">
              <p className="text-foreground">{order.supplierName ?? "—"}</p>
              <p className="text-muted-foreground">
                {order.trackingNumber ? `${order.carrier} · ${order.trackingNumber}` : "No tracking yet"}
              </p>
            </InfoCard>
          )}
          {hasCjItems && (
            <InfoCard title="Fulfillment — CJdropshipping">
              <div className="flex items-center gap-1.5">
                <StatusBadge status={order.cjSyncStatus ?? "not_sent"} />
                {order.cjOrderId && <span className="text-xs text-muted-foreground">{order.cjOrderId}</span>}
              </div>
              <p className="text-muted-foreground">{order.cjShippingLineName ?? "No shipping line yet"}</p>
              <p className="text-muted-foreground">{order.cjTrackingNumber ?? "No CJ tracking yet"}</p>
            </InfoCard>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-foreground">Order placed</span>
              <span className="text-xs text-muted-foreground">{formatDateTime(order.placedAt)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-foreground">Last updated</span>
              <span className="text-xs text-muted-foreground">{formatDateTime(order.updatedAt)}</span>
            </li>
          </ul>
        </section>
      </div>
    </SlideOver>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3 text-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
