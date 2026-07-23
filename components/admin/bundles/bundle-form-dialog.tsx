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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductPicker } from "@/components/admin/bundles/product-picker";
import type { AdminBundle, BundleDiscountType, BundleStatus } from "@/lib/admin/bundles";
import type { BundleInput } from "@/lib/admin/bundle-actions";

const typeItems: Record<BundleDiscountType, string> = { percent: "Percentage off", fixed: "Fixed amount off" };
const statusItems: Record<BundleStatus, string> = { active: "Active", draft: "Draft" };

interface BundleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: AdminBundle | null;
  onSubmit: (input: BundleInput) => Promise<void>;
  submitting: boolean;
}

export function BundleFormDialog({ open, onOpenChange, bundle, onSubmit, submitting }: BundleFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<BundleDiscountType>("percent");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [status, setStatus] = useState<BundleStatus>("draft");
  const [products, setProducts] = useState<{ id: string; title: string; image: string; price: number }[]>([]);

  useEffect(() => {
    if (open) {
      setName(bundle?.name ?? "");
      setDescription(bundle?.description ?? "");
      setDiscountType(bundle?.discountType ?? "percent");
      setDiscountPercent(bundle?.discountPercent ? String(bundle.discountPercent) : "");
      setDiscountAmount(bundle?.discountAmount ? String(bundle.discountAmount) : "");
      setStatus(bundle?.status ?? "draft");
      setProducts(bundle?.products ?? []);
    }
  }, [open, bundle]);

  const canSubmit =
    name.trim().length > 0 &&
    products.length >= 2 &&
    (discountType === "percent"
      ? Number(discountPercent) >= 1 && Number(discountPercent) <= 100
      : Number(discountAmount) > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bundle ? "Edit bundle" : "New bundle"}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bundle-name">Name</Label>
            <Input id="bundle-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home Office Starter Kit" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bundle-description">Description (optional)</Label>
            <Textarea id="bundle-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Products in this bundle</Label>
            <ProductPicker selected={products} onChange={setProducts} />
            <p className="text-xs text-muted-foreground">The discount applies automatically once a cart contains every product above.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Discount type</Label>
            <Select value={discountType} onValueChange={(v) => v && setDiscountType(v as BundleDiscountType)} items={typeItems}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percentage off</SelectItem>
                <SelectItem value="fixed">Fixed amount off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {discountType === "percent" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bundle-percent">Percent off combined price</Label>
              <Input id="bundle-percent" type="number" min={1} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="e.g. 10" />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bundle-amount">Amount off ($)</Label>
              <Input id="bundle-amount" type="number" min={0.01} step={0.01} value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="e.g. 15.00" />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as BundleStatus)} items={statusItems}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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
                name,
                description,
                discountType,
                discountPercent: discountType === "percent" ? Number(discountPercent) : undefined,
                discountAmount: discountType === "fixed" ? Number(discountAmount) : undefined,
                status,
                productIds: products.map((p) => p.id),
              })
            }
          >
            {submitting ? "Saving..." : bundle ? "Save changes" : "Create bundle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
