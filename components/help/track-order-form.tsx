"use client";

import { useActionState } from "react";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackOrderAction } from "@/lib/track-order-actions";
import type { TrackOrderState } from "@/lib/track-order-actions";

const initialState: TrackOrderState = {};

export function TrackOrderForm() {
  const [state, formAction, isPending] = useActionState(trackOrderAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="order-number">Order number</Label>
          <Input id="order-number" name="orderNumber" required placeholder="e.g. BS-482913" className="font-mono" />
        </div>
        <Button type="submit" disabled={isPending} className="gap-1.5">
          <PackageSearch className="h-3.5 w-3.5" />
          {isPending ? "Looking up..." : "Track order"}
        </Button>
      </form>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      {state.order && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{state.order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">Placed {new Date(state.order.placedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
              {state.order.fulfillmentStatus}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {state.order.trackingNumber ? (
              <p className="text-foreground">
                <span className="text-muted-foreground">{state.order.carrier ?? "Tracking"}: </span>
                <span className="font-mono">{state.order.trackingNumber}</span>
              </p>
            ) : (
              !state.order.cjTrackingNumber && (
                <p className="text-muted-foreground">Tracking number not assigned yet — we&apos;ll email it as soon as your order ships.</p>
              )
            )}
            {state.order.cjTrackingNumber && (
              <p className="text-foreground">
                <span className="text-muted-foreground">Supplier shipment: </span>
                <span className="font-mono">{state.order.cjTrackingNumber}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
