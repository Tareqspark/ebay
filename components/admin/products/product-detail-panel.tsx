"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { CategoryPicker, type LeafOption } from "@/components/admin/products/category-picker";
import { FieldChanges } from "@/components/admin/shared/field-changes";
import { updateProductDetailsAction } from "@/lib/admin/product-actions";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import { statusConfig } from "@/lib/admin/status";
import type { AdminProductRow } from "@/lib/admin/data";
import type { Product } from "@/lib/types";
import type { ActivityEvent, ProductStatus, ProductVisibility } from "@/lib/admin/types";

const statusItems = { active: "Active", draft: "Draft", archived: "Archived" };
const visibilityItems = { visible: "Visible", hidden: "Hidden" };

interface ProductDetailPanelProps {
  open: boolean;
  row: AdminProductRow | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (productId: string, patch: { status?: ProductStatus; visibility?: ProductVisibility }) => void;
  /** Called after a successful save so the table can refresh its rows. */
  onSaved?: () => void;
}

export function ProductDetailPanel({ open, row, onOpenChange, onUpdate, onSaved }: ProductDetailPanelProps) {
  // The table rows arrive without descriptions or full galleries — those are
  // stripped server-side because shipping them for all ~11.7k products froze
  // the page (see getAdminProductTableRows). Fetch them for just the product
  // being opened. Declared above the early return so the hooks always run.
  const productId = row?.product.id;
  const [full, setFull] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LeafOption | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  // Resolved from the product's slug path — the row itself has no leaf id,
  // and saving needs one even when the category isn't being changed.
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Edit history, loaded only when the History tab is opened — most panel
  // opens never look at it, and it is a second query per product.
  const [history, setHistory] = useState<ActivityEvent[] | null>(null);
  const [historyError, setHistoryError] = useState(false);
  const [tab, setTab] = useState("general");

  useEffect(() => {
    if (!open || !productId) return;
    let cancelled = false;
    setFull(null);
    // Belongs to the product being replaced, not this one.
    setHistory(null);
    setHistoryError(false);
    setTab("general");
    fetch(`/api/products?ids=${encodeURIComponent(productId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setFull(data.products?.[0] ?? null);
      })
      .catch(() => {
        // Non-fatal: the panel still renders everything the table already knows.
      });
    return () => {
      cancelled = true;
    };
  }, [open, productId]);

  // Only fetched once the History tab is actually opened. Most panel opens are
  // to edit or check a field and never look at it, and this is a second query.
  useEffect(() => {
    if (tab !== "history" || !productId || history !== null) return;
    let cancelled = false;
    fetch(`/api/admin/products/${encodeURIComponent(productId)}/history`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled) setHistory(data.events ?? []);
      })
      .catch(() => {
        // Distinguished from "no history": an empty list is a real answer,
        // a failed request is not, and they must not read the same.
        if (!cancelled) setHistoryError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, productId, history]);

  // Editable fields are seeded once the full product lands — the trimmed
  // table row has no description at all.
  useEffect(() => {
    if (!full) return;
    setTitle(full.title);
    setDescription(full.description ?? "");
    setCategory(null);
  }, [full]);

  // The product carries slugs; this turns them into "Top > Child > Leaf" for
  // display. Falls back to the raw slugs if the lookup fails, which is still
  // more informative than the top-level-only name the table has.
  const slugPathKey = full?.categorySlugPath?.join("/") ?? "";
  useEffect(() => {
    if (!slugPathKey) return;
    let cancelled = false;
    setCurrentPath(slugPathKey.split("/").join(" > "));
    setCurrentCategoryId(null);
    fetch(`/api/admin/categories/leaf-search?slugPath=${encodeURIComponent(slugPathKey)}`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.options?.[0];
        if (cancelled || !found) return;
        setCurrentPath(found.path);
        setCurrentCategoryId(found.id);
      })
      .catch(() => {
        // Keep the slug fallback already set above.
      });
    return () => {
      cancelled = true;
    };
  }, [slugPathKey]);

  if (!row) {
    return (
      <SlideOver open={open} onOpenChange={onOpenChange} title="Product details">
        {null}
      </SlideOver>
    );
  }

  // categoryName is dropped on purpose: it only ever held the top-level name,
  // which is why the panel used to label a spotting scope
  // "cameras-and-photography". The full leaf path is resolved below instead.
  const { meta, brandName, supplierName, margin, marginPercent } = row;
  // Prefer the fully-loaded copy once it lands; until then the trimmed row
  // still renders title, price, and stock so the panel is never blank.
  const product = full ?? row.product;

  const dirty =
    Boolean(full) &&
    (title !== product.title || description !== (product.description ?? "") || category !== null);

  /**
   * Writes the edits.
   *
   * This button used to fire toast.success("Product updated") and close,
   * saving nothing — so a recategorisation looked like it worked and didn't.
   */
  async function save() {
    if (!full) return;
    setSaving(true);
    try {
      const result = await updateProductDetailsAction(product.id, {
        title,
        description,
        // Unchanged category still has to be sent: the action writes
        // categoryId and categorySlugPath together and needs the current one.
        categoryId: category?.id ?? currentCategoryId ?? "",
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Product updated");
      onOpenChange(false);
      onSaved?.();
    } catch {
      toast.error("Couldn't save — please try again.");
    } finally {
      setSaving(false);
    }
  }

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
          <Button disabled={!dirty || saving || !full} onClick={save}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
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

        <Tabs value={tab} onValueChange={(v) => setTab(v ?? "general")}>
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="pricing" className="flex-1">Pricing</TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
            <TabsTrigger value="supplier" className="flex-1">Supplier</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pd-title">Title</Label>
              <Input id="pd-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!full} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Brand</Label>
                <Input defaultValue={brandName} disabled />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <CategoryPicker
                value={currentCategoryId ?? ""}
                currentPath={currentPath}
                onChange={setCategory}
                disabled={!full}
              />
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
              <Label htmlFor="pd-description">Description</Label>
              <Textarea
                id="pd-description"
                rows={6}
                value={full ? description : ""}
                placeholder={full ? "" : "Loading description…"}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!full}
              />
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
              <p className="rounded-md border border-warning bg-warning px-3 py-2 text-xs text-warning">
                This product is flagged for review — margin or listing data may need attention.
              </p>
            )}
          </TabsContent>

          {/*
            What staff changed, and what it was before. The message alone names
            the fields; the diff underneath carries the values, which is the
            point of the audit trail.
          */}
          <TabsContent value="history" className="flex flex-col gap-3 pt-4">
            {historyError ? (
              <p className="text-sm text-muted-foreground">Could not load this product&apos;s history.</p>
            ) : history === null ? (
              <p className="text-sm text-muted-foreground">Loading history…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recorded changes. Edits made from here appear in this list.
              </p>
            ) : (
              <ol className="flex flex-col gap-3">
                {history.map((event) => (
                  <li key={event.id} className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 px-3 py-2">
                    <p className="text-sm text-foreground">{event.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.actor} · {formatDateTime(event.createdAt)}
                    </p>
                    {event.changes && <FieldChanges changes={event.changes} className="pt-0.5" />}
                  </li>
                ))}
              </ol>
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
