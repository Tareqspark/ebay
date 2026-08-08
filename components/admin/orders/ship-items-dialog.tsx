"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shipOrderItemsAction } from "@/lib/admin/order-actions";
import type { OrderItem } from "@/lib/admin/types";

/**
 * Ships some or all of an order's outstanding lines as one parcel. A hybrid
 * order normally splits — own stock leaves today, the CJ line leaves when CJ
 * dispatches it — so each parcel gets its own carrier and tracking rather
 * than the order carrying a single tracking number that can only describe
 * one of them.
 */
export function ShipItemsDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [source, setSource] = useState<"self" | "cj">("self");
  const [pending, startTransition] = useTransition();

  const outstanding = items
    .filter((i) => i.id)
    .map((i) => ({ item: i, left: i.quantity - (i.fulfilledQuantity ?? 0) }))
    .filter((o) => o.left > 0);

  useEffect(() => {
    if (!open) return;
    // Default to shipping everything outstanding — the common case is one
    // parcel with the rest of the order in it.
    setQuantities(Object.fromEntries(outstanding.map((o) => [o.item.id!, o.left])));
    setCarrier("");
    setTracking("");
    setSource(outstanding.some((o) => o.item.source === "self") ? "self" : "cj");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  const units = Object.values(quantities).reduce((sum, q) => sum + (q || 0), 0);

  function submit() {
    startTransition(async () => {
      const result = await shipOrderItemsAction({
        orderId,
        orderNumber,
        source,
        carrier: carrier || undefined,
        trackingNumber: tracking || undefined,
        quantities,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Shipment recorded for ${orderNumber}`);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ship items — {orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto py-2">
          {outstanding.length === 0 ? (
            <p className="text-sm text-muted-foreground">Every item on this order has already shipped.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {outstanding.map(({ item, left }) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-md border border-border p-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {left} of {item.quantity} left · {item.source === "cj" ? "CJdropshipping" : "own stock"}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={left}
                      value={quantities[item.id!] ?? 0}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.id!]: Math.max(0, Math.min(left, Number(e.target.value) || 0)),
                        }))
                      }
                      className="h-8 w-20"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ship-carrier">Carrier</Label>
                  <Input id="ship-carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. USPS" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ship-tracking">Tracking number</Label>
                  <Input
                    id="ship-tracking"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="Paste from the carrier"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave tracking blank if you don&apos;t have it yet — it can be added on a later shipment. Only paste a
                real number; the customer will see it.
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={units === 0 || pending} onClick={submit}>
            {pending ? "Recording..." : `Ship ${units} item${units === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
