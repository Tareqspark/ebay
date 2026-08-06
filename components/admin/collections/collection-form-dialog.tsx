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
import { FilterSelect } from "@/components/admin/table/filter-select";
import { ProductPicker } from "@/components/admin/bundles/product-picker";
import { Checkbox } from "@/components/ui/checkbox";
import type { Collection, CollectionType, CollectionStatus, CollectionPickerProduct } from "@/lib/admin/collections";
import type { CollectionInput } from "@/lib/admin/collection-actions";

const typeItems: Record<CollectionType, string> = { manual: "Manual", automated: "Automated" };
const statusItems: Record<CollectionStatus, string> = { active: "Active", draft: "Draft" };

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection | null;
  topCategoryOptions: { value: string; label: string }[];
  onSubmit: (input: CollectionInput) => Promise<void>;
  submitting: boolean;
}

export function CollectionFormDialog({
  open,
  onOpenChange,
  collection,
  topCategoryOptions,
  onSubmit,
  submitting,
}: CollectionFormDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CollectionType>("manual");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CollectionStatus>("draft");
  const [products, setProducts] = useState<CollectionPickerProduct[]>([]);
  const [topCategorySlug, setTopCategorySlug] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [bundledOnly, setBundledOnly] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(collection?.name ?? "");
    setType(collection?.type ?? "manual");
    setDescription(collection?.ruleDescription ?? "");
    setStatus(collection?.status ?? "draft");
    setProducts(collection?.products ?? []);
    setTopCategorySlug(collection?.rule.topCategorySlug ?? "all");
    setMinPrice(collection?.rule.minPrice != null ? String(collection.rule.minPrice) : "");
    setMaxPrice(collection?.rule.maxPrice != null ? String(collection.rule.maxPrice) : "");
    setMinRating(collection?.rule.minRating != null ? String(collection.rule.minRating) : "");
    setBundledOnly(collection?.rule.bundledOnly ?? false);
  }, [open, collection]);

  const canSubmit =
    name.trim().length > 0 &&
    (type === "manual"
      ? products.length > 0
      : topCategorySlug !== "all" || minPrice.trim() || maxPrice.trim() || minRating.trim() || bundledOnly);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{collection ? "Edit collection" : "New collection"}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="collection-name">Name</Label>
            <Input id="collection-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Essentials" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="collection-description">Description (optional)</Label>
            <Textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shown at the top of this collection's page on the storefront"
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as CollectionType)} items={typeItems}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automated">Automated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "manual" ? (
            <div className="flex flex-col gap-1.5">
              <Label>Products in this collection</Label>
              <ProductPicker selected={products} onChange={setProducts} />
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">
                Membership is calculated live from these conditions — a product that matches shows up automatically, no re-curating needed. Leave a condition blank to skip it.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <FilterSelect value={topCategorySlug} onChange={setTopCategorySlug} options={topCategoryOptions} allLabel="Any category" width="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="collection-min-price">Min price ($)</Label>
                  <Input id="collection-min-price" type="number" min={0} step={0.01} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="e.g. 10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="collection-max-price">Max price ($)</Label>
                  <Input id="collection-max-price" type="number" min={0} step={0.01} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="e.g. 50" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="collection-min-rating">Minimum rating</Label>
                <Input id="collection-min-rating" type="number" min={0} max={5} step={0.1} value={minRating} onChange={(e) => setMinRating(e.target.value)} placeholder="e.g. 4.0" />
              </div>
              <label htmlFor="collection-bundled-only" className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox id="collection-bundled-only" checked={bundledOnly} onCheckedChange={(checked) => setBundledOnly(checked === true)} />
                Only products currently in an active bundle
              </label>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as CollectionStatus)} items={statusItems}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
                type,
                description,
                status,
                productIds: products.map((p) => p.id),
                rule: {
                  topCategorySlug: topCategorySlug === "all" ? undefined : topCategorySlug,
                  minPrice: minPrice.trim() ? Number(minPrice) : undefined,
                  maxPrice: maxPrice.trim() ? Number(maxPrice) : undefined,
                  minRating: minRating.trim() ? Number(minRating) : undefined,
                  bundledOnly: bundledOnly || undefined,
                },
              })
            }
          >
            {submitting ? "Saving..." : collection ? "Save changes" : "Create collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
