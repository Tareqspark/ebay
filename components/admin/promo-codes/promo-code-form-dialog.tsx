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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PromoCode, PromoDiscountType, PromoCodeStatus } from "@/lib/admin/promos";
import type { PromoCodeInput } from "@/lib/admin/promo-actions";

const typeItems: Record<PromoDiscountType, string> = {
  percent: "Percentage off",
  fixed: "Fixed amount off",
  free_shipping: "Free delivery",
};
const statusItems: Record<PromoCodeStatus, string> = { active: "Active", disabled: "Disabled" };

function toDateInputValue(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

interface PromoCodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promo: PromoCode | null;
  onSubmit: (input: PromoCodeInput) => Promise<void>;
  submitting: boolean;
}

export function PromoCodeFormDialog({ open, onOpenChange, promo, onSubmit, submitting }: PromoCodeFormDialogProps) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<PromoDiscountType>("percent");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [limitUses, setLimitUses] = useState(false);
  const [usageLimit, setUsageLimit] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [status, setStatus] = useState<PromoCodeStatus>("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (open) {
      setCode(promo?.code ?? "");
      setDiscountType(promo?.discountType ?? "percent");
      setDiscountPercent(promo?.discountPercent ? String(promo.discountPercent) : "");
      setDiscountAmount(promo?.discountAmount ? String(promo.discountAmount) : "");
      setLimitUses(promo?.usageLimit != null);
      setUsageLimit(promo?.usageLimit ? String(promo.usageLimit) : "1");
      setMinOrderAmount(promo?.minOrderAmount ? String(promo.minOrderAmount) : "");
      setStatus(promo?.status ?? "active");
      setStartDate(toDateInputValue(promo?.startDate) || new Date().toISOString().slice(0, 10));
      setEndDate(toDateInputValue(promo?.endDate));
    }
  }, [open, promo]);

  const canSubmit =
    /^[A-Za-z0-9_-]{3,40}$/.test(code.trim()) &&
    !!startDate &&
    (discountType === "free_shipping" ||
      (discountType === "percent" && Number(discountPercent) >= 1 && Number(discountPercent) <= 100) ||
      (discountType === "fixed" && Number(discountAmount) > 0)) &&
    (!limitUses || (Number.isInteger(Number(usageLimit)) && Number(usageLimit) >= 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{promo ? "Edit promo code" : "New promo code"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="promo-code">Code</Label>
            <Input
              id="promo-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10"
              className="font-mono text-xs"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Letters, numbers, hyphens, or underscores — 3 to 40 characters.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Discount type</Label>
            <Select value={discountType} onValueChange={(v) => v && setDiscountType(v as PromoDiscountType)} items={typeItems}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percentage off</SelectItem>
                <SelectItem value="fixed">Fixed amount off</SelectItem>
                <SelectItem value="free_shipping">Free delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {discountType === "percent" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-percent">Percent off</Label>
              <Input
                id="promo-percent"
                type="number"
                min={1}
                max={100}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 15"
              />
            </div>
          )}
          {discountType === "fixed" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-amount">Amount off ($)</Label>
              <Input
                id="promo-amount"
                type="number"
                min={0.01}
                step={0.01}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="e.g. 10.00"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <Label htmlFor="promo-limit-uses">Limit total redemptions</Label>
                <p className="text-xs text-muted-foreground">Off = unlimited. Set to 1 for a one-time code, or higher for a limited batch.</p>
              </div>
              <Switch id="promo-limit-uses" checked={limitUses} onCheckedChange={setLimitUses} />
            </div>
            {limitUses && (
              <Input
                type="number"
                min={1}
                step={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="e.g. 1"
                className="w-32"
              />
            )}
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            Every code — limited or not — can only be redeemed once per customer.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="promo-min-order">Minimum order amount ($, optional)</Label>
            <Input
              id="promo-min-order"
              type="number"
              min={0}
              step={0.01}
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="No minimum"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-start">Start date</Label>
              <Input id="promo-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-end">End date (optional)</Label>
              <Input id="promo-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as PromoCodeStatus)} items={statusItems}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || submitting}
            onClick={() =>
              onSubmit({
                code,
                discountType,
                discountPercent: discountType === "percent" ? Number(discountPercent) : undefined,
                discountAmount: discountType === "fixed" ? Number(discountAmount) : undefined,
                usageLimit: limitUses ? Number(usageLimit) : undefined,
                minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
                status,
                startDate,
                endDate,
              })
            }
          >
            {submitting ? "Saving..." : promo ? "Save changes" : "Create promo code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
