"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShippingRate, ShippingRateStatus, Carrier } from "@/lib/admin/shipping";
import type { ShippingRateInput } from "@/lib/admin/shipping-actions";

const statusItems: Record<ShippingRateStatus, string> = { active: "Active", disabled: "Disabled" };
const NO_CARRIER = "none";

interface ShippingRateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rate: ShippingRate | null;
  carriers: Carrier[];
  onSubmit: (input: ShippingRateInput) => Promise<void>;
  submitting: boolean;
}

export function ShippingRateFormDialog({ open, onOpenChange, rate, carriers, onSubmit, submitting }: ShippingRateFormDialogProps) {
  const [zone, setZone] = useState("");
  const [method, setMethod] = useState("");
  const [condition, setCondition] = useState("");
  const [rateValue, setRateValue] = useState("0");
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [status, setStatus] = useState<ShippingRateStatus>("active");
  const [carrierId, setCarrierId] = useState(NO_CARRIER);
  const [minSubtotal, setMinSubtotal] = useState("");
  const [maxSubtotal, setMaxSubtotal] = useState("");

  useEffect(() => {
    if (open) {
      setZone(rate?.zone ?? "");
      setMethod(rate?.method ?? "");
      setCondition(rate?.condition ?? "");
      setRateValue(String(rate?.rate ?? 0));
      setDeliveryEstimate(rate?.deliveryEstimate ?? "");
      setStatus(rate?.status ?? "active");
      setCarrierId(rate?.carrierId ?? NO_CARRIER);
      setMinSubtotal(rate?.minSubtotal != null ? String(rate.minSubtotal) : "");
      setMaxSubtotal(rate?.maxSubtotal != null ? String(rate.maxSubtotal) : "");
    }
  }, [open, rate]);

  const parsedRate = Number.parseFloat(rateValue);
  const rateValid = !Number.isNaN(parsedRate) && parsedRate >= 0;
  const carrierItems: Record<string, string> = { [NO_CARRIER]: "No specific carrier", ...Object.fromEntries(carriers.map((c) => [c.id, c.name])) };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{rate ? "Edit shipping rate" : "New shipping rate"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate-zone">Zone</Label>
              <Input id="rate-zone" value={zone} onChange={(e) => setZone(e.target.value)} placeholder="e.g. Domestic" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate-method">Method</Label>
              <Input id="rate-method" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="e.g. Standard" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rate-condition">Condition (display label)</Label>
            <Input id="rate-condition" value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="e.g. Orders under $50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate-min">Min. order value ($, optional)</Label>
              <Input id="rate-min" type="number" step="0.01" min="0" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} placeholder="No minimum" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate-max">Max. order value ($, optional)</Label>
              <Input id="rate-max" type="number" step="0.01" min="0" value={maxSubtotal} onChange={(e) => setMaxSubtotal(e.target.value)} placeholder="No maximum" />
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            These thresholds decide which rates actually show up at checkout for a given order total — the condition label above is just how it displays.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate-value">Rate ($, 0 = free)</Label>
              <Input id="rate-value" type="number" step="0.01" min="0" value={rateValue} onChange={(e) => setRateValue(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as ShippingRateStatus)} items={statusItems}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Carrier</Label>
            <Select value={carrierId} onValueChange={(v) => v && setCarrierId(v)} items={carrierItems}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CARRIER}>No specific carrier</SelectItem>
                {carriers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rate-estimate">Delivery estimate</Label>
            <Input id="rate-estimate" value={deliveryEstimate} onChange={(e) => setDeliveryEstimate(e.target.value)} placeholder="e.g. 3-5 business days" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                zone,
                method,
                condition,
                rate: parsedRate,
                deliveryEstimate,
                status,
                carrierId: carrierId === NO_CARRIER ? null : carrierId,
                minSubtotal: minSubtotal.trim() ? Number.parseFloat(minSubtotal) : null,
                maxSubtotal: maxSubtotal.trim() ? Number.parseFloat(maxSubtotal) : null,
              })
            }
            disabled={!zone.trim() || !method.trim() || !condition.trim() || !deliveryEstimate.trim() || !rateValid || submitting}
          >
            {submitting ? "Saving..." : rate ? "Save changes" : "Create rate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
