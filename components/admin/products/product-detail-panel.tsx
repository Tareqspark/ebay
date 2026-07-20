"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SlideOver } from "@/components/admin/shared/slide-over";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import { statusConfig } from "@/lib/admin/status";
import type { AdminProductRow } from "@/lib/admin/data";
import type { ProductStatus, ProductVisibility } from "@/lib/admin/types";

const statusItems = { active: "Active", draft: "Draft", archived: "Archived" };
const visibilityItems = { visible: "Visible", hidden: "Hidden" };

interface ProductDetailPanelProps {
  open: boolean;
  row: AdminProductRow | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (productId: string, patch: { status?: ProductStatus; visibility?: ProductVisibility }) => void;
}

export function ProductDetailPanel({ open, row, onOpenChange, onUpdate }: ProductDetailPanelProps) {
  if (!row) {
    return (
      <SlideOver open={open} onOpenChange={onOpenChange} title="Product details">
        {null}
      </SlideOver>
    );
  }

  const { product, meta, brandName, supplierName, categoryName, margin, marginPercent } = row;

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      wide
      title={
        <div className="flex items-center gap-2">
          <span className="truncate">{product.title}</span>
          <StatusBadge status={meta.status} />
        </div>
      }
      footer={
        <div className="flex items-center justify-between">
          <Button
            variant="link"
            className="px-0"
            nativeButton={false}
            render={
              <Link href={`/product/${product.slug}`} target="_blank">
                View in storefront
                <ExternalLink />
              </Link>
            }
          />
          <Button onClick={() => { toast.success("Product updated"); onOpenChange(false); }}>Save changes</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex gap-3 overflow-x-auto">
          {product.images.map((src) => (
            <div key={src} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>

        <Tabs defaultValue="general">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="pricing" className="flex-1">Pricing</TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
            <TabsTrigger value="supplier" className="flex-1">Supplier</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input defaultValue={product.title} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Brand</Label>
                <Input defaultValue={brandName} disabled />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Input defaultValue={categoryName} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select defaultValue={meta.status} onValueChange={(v) => v && onUpdate(product.id, { status: v as ProductStatus })} items={statusItems}>
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
                <Select defaultValue={meta.visibility} onValueChange={(v) => v && onUpdate(product.id, { visibility: v as ProductVisibility })} items={visibilityItems}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="flex flex-col gap-4 pt-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Price" value={formatMoney(product.price)} />
              <Stat label="Cost" value={formatMoney(meta.cost)} />
              <Stat label="Margin" value={`${formatMoney(margin)} (${marginPercent.toFixed(1)}%)`} />
            </div>
            {meta.source === "cj" && (
              <Stat
                label="CJ shipping fee"
                value={`${formatMoney(meta.cjShippingFee ?? 0)} — added to cost, not baked into product cost above`}
              />
            )}
            {product.originalPrice && (
              <Stat label="Compare-at price" value={formatMoney(product.originalPrice)} />
            )}
            <p className="text-xs text-muted-foreground">
              Price and cost can also be edited inline from the products table.
            </p>
          </TabsContent>

          <TabsContent value="inventory" className="flex flex-col gap-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Stock on hand" value={product.stock.toLocaleString()} />
              <Stat label="Free shipping" value={product.freeShipping ? "Yes" : "No"} />
            </div>
            {meta.source === "cj" && (
              <div className="grid grid-cols-2 gap-3">
                <Stat label="CJ stock status" value={meta.cjStockStatus ? statusConfig(meta.cjStockStatus).label : "—"} />
                <Stat label="Source warehouse" value={meta.cjSourceWarehouse === "CN" ? "China" : "United States"} />
              </div>
            )}
            <Stat label="Rating" value={`${product.review.rating.toFixed(1)} (${product.review.count.toLocaleString()} reviews)`} />
          </TabsContent>

          <TabsContent value="supplier" className="flex flex-col gap-4 pt-4">
            <Stat label="Supplier" value={supplierName} />
            <Stat label="Imported" value={formatDateTime(meta.importedAt)} />
            <Stat label="Last updated" value={formatDateTime(meta.lastUpdatedAt)} />
            {meta.source === "cj" && (
              <div className="grid grid-cols-2 gap-3">
                <Stat label="CJ Product ID" value={meta.cjProductId ?? "—"} />
                <Stat label="CJ Variant ID" value={meta.cjVariantId ?? "—"} />
              </div>
            )}
            {meta.needsReview && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400">
                This product is flagged for review — margin or listing data may need attention.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SlideOver>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
