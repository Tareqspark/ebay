"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductImageUpload } from "@/components/admin/products/product-image-upload";
import type { CreateProductInput } from "@/lib/admin/product-actions";
import type { ProductStatus, ProductVisibility } from "@/lib/admin/types";

/** Three fixed levels, matching the category tree the storefront routes on. */
export interface CategoryNode {
  name: string;
  slug: string;
  children: { name: string; slug: string; children: { name: string; slug: string }[] }[];
}

const statusItems = { active: "Active", draft: "Draft", archived: "Archived" };
const visibilityItems = { visible: "Visible", hidden: "Hidden" };

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryTree: CategoryNode[];
  brandOptions: { value: string; label: string }[];
  onSubmit: (input: CreateProductInput) => Promise<void>;
  submitting: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  categoryTree,
  brandOptions,
  onSubmit,
  submitting,
}: ProductFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [topSlug, setTopSlug] = useState("");
  const [childSlug, setChildSlug] = useState("");
  const [leafSlug, setLeafSlug] = useState("");
  const [brandId, setBrandId] = useState("");
  const [stock, setStock] = useState("0");
  const [sku, setSku] = useState("");
  const [warehouse, setWarehouse] = useState("Main");
  const [freeShipping, setFreeShipping] = useState(false);
  const [status, setStatus] = useState<ProductStatus>("draft");
  const [visibility, setVisibility] = useState<ProductVisibility>("visible");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setPrice("");
    setCost("");
    setOriginalPrice("");
    setImages([]);
    setTopSlug("");
    setChildSlug("");
    setLeafSlug("");
    setBrandId("");
    setStock("0");
    setSku("");
    setWarehouse("Main");
    setFreeShipping(false);
    setStatus("draft");
    setVisibility("visible");
  }, [open]);

  const children = useMemo(() => categoryTree.find((c) => c.slug === topSlug)?.children ?? [], [categoryTree, topSlug]);
  const leaves = useMemo(() => children.find((c) => c.slug === childSlug)?.children ?? [], [children, childSlug]);

  const canSubmit =
    title.trim().length > 0 &&
    images.length > 0 &&
    !!leafSlug &&
    !!brandId &&
    Number(price) > 0 &&
    sku.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New product</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-title">Title</Label>
            <Input id="product-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Merino Wool Travel Blanket" autoFocus />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Photos</Label>
            <ProductImageUpload value={images} onChange={setImages} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-description">Description</Label>
            <Textarea id="product-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What it is, what it's made of, why someone would buy it." />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-price">Price ($)</Label>
              <Input id="product-price" type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-cost">Your cost ($)</Label>
              <Input id="product-cost" type="number" min={0} step={0.01} value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-compare">Compare-at ($)</Label>
              <Input id="product-compare" type="number" min={0} step={0.01} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="optional" />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={topSlug || undefined}
                onValueChange={(v) => {
                  if (!v) return;
                  setTopSlug(v);
                  setChildSlug("");
                  setLeafSlug("");
                }}
                items={Object.fromEntries(categoryTree.map((c) => [c.slug, c.name]))}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {categoryTree.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select
                value={childSlug || undefined}
                onValueChange={(v) => {
                  if (!v) return;
                  setChildSlug(v);
                  setLeafSlug("");
                }}
                disabled={!topSlug}
                items={Object.fromEntries(children.map((c) => [c.slug, c.name]))}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {children.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select
                value={leafSlug || undefined}
                onValueChange={(v) => v && setLeafSlug(v)}
                disabled={!childSlug}
                items={Object.fromEntries(leaves.map((c) => [c.slug, c.name]))}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Subcategory" /></SelectTrigger>
                <SelectContent>
                  {leaves.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Brand</Label>
            <Select value={brandId || undefined} onValueChange={(v) => v && setBrandId(v)} items={Object.fromEntries(brandOptions.map((b) => [b.value, b.label]))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose a brand" /></SelectTrigger>
              <SelectContent>
                {brandOptions.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-sku">SKU</Label>
              <Input id="product-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. CB-BLK-001" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-stock">Stock on hand</Label>
              <Input id="product-stock" type="number" min={0} step={1} value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-warehouse">Warehouse</Label>
              <Input id="product-warehouse" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} />
            </div>
          </div>

          <label htmlFor="product-free-shipping" className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox id="product-free-shipping" checked={freeShipping} onCheckedChange={(c) => setFreeShipping(c === true)} />
            Offer free shipping on this product
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as ProductStatus)} items={statusItems}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => v && setVisibility(v as ProductVisibility)} items={visibilityItems}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Only Active + Visible products appear on the storefront — leave it as Draft while you finish the listing.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!canSubmit || submitting}
            onClick={() =>
              onSubmit({
                title,
                description,
                price: Number(price),
                cost: Number(cost) || 0,
                originalPrice: originalPrice.trim() ? Number(originalPrice) : undefined,
                images,
                categorySlugPath: [topSlug, childSlug, leafSlug],
                brandId,
                stock: Number(stock) || 0,
                sku,
                warehouse,
                freeShipping,
                status,
                visibility,
              })
            }
          >
            {submitting ? "Creating..." : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
