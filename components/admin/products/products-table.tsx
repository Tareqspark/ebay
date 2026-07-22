"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getProductColumns } from "@/components/admin/products/columns";
import { ProductDetailPanel } from "@/components/admin/products/product-detail-panel";
import {
  updateProductPriceAction,
  updateProductCostAction,
  setProductStatusAction,
  setProductVisibilityAction,
  deleteProductsAction,
} from "@/lib/admin/product-actions";
import type { AdminProductRow } from "@/lib/admin/data";
import type { ProductStatus, ProductVisibility } from "@/lib/admin/types";

const SAVED_VIEWS = [
  { id: "all", label: "All products" },
  { id: "low-margin", label: "Low margin (<15%)" },
  { id: "out-of-stock", label: "Out of stock" },
  { id: "needs-review", label: "Needs review" },
  { id: "active-visible", label: "Active & visible" },
];
const savedViewItems: Record<string, string> = Object.fromEntries(SAVED_VIEWS.map((v) => [v.id, v.label]));
const statusItems = { active: "Active", draft: "Draft", archived: "Archived" };
const visibilityItems = { visible: "Visible", hidden: "Hidden" };

interface ProductsTableProps {
  initialRows: AdminProductRow[];
  categoryOptions: { value: string; label: string }[];
}

export function ProductsTable({ initialRows, categoryOptions }: ProductsTableProps) {
  const [rows, setRows] = useState(initialRows);
  const [status, setStatus] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("all");
  const [savedView, setSavedView] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const rowsById = useMemo(() => new Map(rows.map((r) => [r.product.id, r])), [rows]);
  const detailRow = detailProductId ? rowsById.get(detailProductId) ?? null : null;

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.meta.status !== status) return false;
      if (visibility !== "all" && r.meta.visibility !== visibility) return false;
      if (category !== "all" && r.product.categorySlugPath[0] !== category) return false;
      if (source !== "all" && r.meta.source !== source) return false;
      if (savedView === "low-margin" && r.marginPercent >= 15) return false;
      if (savedView === "out-of-stock" && r.product.stock !== 0) return false;
      if (savedView === "needs-review" && !r.meta.needsReview) return false;
      if (savedView === "active-visible" && !(r.meta.status === "active" && r.meta.visibility === "visible")) return false;
      return true;
    });
  }, [rows, status, visibility, category, source, savedView]);

  function updateProductLocal(productId: string, patch: Partial<AdminProductRow["product"]>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.product.id !== productId) return r;
        const product = { ...r.product, ...patch };
        const margin = Math.round((product.price - r.meta.cost) * 100) / 100;
        return { ...r, product, margin, marginPercent: Math.round((margin / product.price) * 1000) / 10 };
      })
    );
  }

  function updateMetaLocal(productId: string, patch: Partial<AdminProductRow["meta"]>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.product.id !== productId) return r;
        const meta = { ...r.meta, ...patch, lastUpdatedAt: new Date().toISOString() };
        const margin = Math.round((r.product.price - meta.cost) * 100) / 100;
        return { ...r, meta, margin, marginPercent: Math.round((margin / r.product.price) * 1000) / 10 };
      })
    );
  }

  const updatePrice = useCallback(async (productId: string, price: number) => {
    const result = await updateProductPriceAction(productId, price);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    updateProductLocal(productId, { price });
  }, []);

  const updateCost = useCallback(async (productId: string, cost: number) => {
    const result = await updateProductCostAction(productId, cost);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    updateMetaLocal(productId, { cost });
  }, []);

  const updateMeta = useCallback(async (productId: string, patch: { status?: ProductStatus; visibility?: ProductVisibility }) => {
    const result = patch.status
      ? await setProductStatusAction([productId], patch.status)
      : patch.visibility
        ? await setProductVisibilityAction([productId], patch.visibility)
        : {};
    if (result.error) {
      toast.error(result.error);
      return;
    }
    updateMetaLocal(productId, patch);
  }, []);

  async function bulkUpdateStatus(ids: string[], next: ProductStatus) {
    const result = await setProductStatusAction(ids, next);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.map((r) => (ids.includes(r.product.id) ? { ...r, meta: { ...r.meta, status: next } } : r)));
    toast.success(`Updated status for ${ids.length} product${ids.length === 1 ? "" : "s"}`);
  }

  async function bulkUpdateVisibility(ids: string[], next: ProductVisibility) {
    const result = await setProductVisibilityAction(ids, next);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.map((r) => (ids.includes(r.product.id) ? { ...r, meta: { ...r.meta, visibility: next } } : r)));
    toast.success(`Updated visibility for ${ids.length} product${ids.length === 1 ? "" : "s"}`);
  }

  function exportCsv(exportRows: AdminProductRow[]) {
    const header = ["Title", "Category", "Price", "Cost", "Margin %", "Inventory", "Supplier", "Status", "Visibility"];
    const lines = exportRows.map((r) =>
      [
        r.product.title,
        r.categoryName,
        r.product.price.toFixed(2),
        r.meta.cost.toFixed(2),
        r.marginPercent.toFixed(1),
        r.product.stock,
        r.supplierName,
        r.meta.status,
        r.meta.visibility,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `baruashop-products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${exportRows.length.toLocaleString()} products`);
  }

  const columns = useMemo(
    () =>
      getProductColumns({
        onEditPrice: (id, price) => updatePrice(id, price),
        onEditCost: (id, cost) => updateCost(id, cost),
        onOpenDetail: (id) => {
          setDetailProductId(id);
          setDetailOpen(true);
        },
        onDuplicate: () => toast.success("Product duplicated as draft"),
        onToggleArchive: async (id) => {
          const row = rowsById.get(id);
          if (!row) return;
          const nextStatus = row.meta.status === "archived" ? "active" : "archived";
          await updateMeta(id, { status: nextStatus });
          toast.success(row.meta.status === "archived" ? "Product restored" : "Product archived");
        },
      }),
    [rowsById, updatePrice, updateCost, updateMeta]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredRows}
        enableSelection
        getRowId={(r) => r.product.id}
        onRowClick={(r) => {
          setDetailProductId(r.product.id);
          setDetailOpen(true);
        }}
        emptyMessage="No products match these filters."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search products..." />
            <FilterSelect value={status} onChange={setStatus} allLabel="All statuses" options={[
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ]} />
            <FilterSelect value={visibility} onChange={setVisibility} allLabel="All visibility" options={[
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ]} />
            <FilterSelect value={category} onChange={setCategory} allLabel="All categories" width="w-[180px]" options={categoryOptions} />
            <FilterSelect
              value={source}
              onChange={setSource}
              allLabel="All sources"
              options={[
                { value: "self", label: "Self-stocked" },
                { value: "cj", label: "CJ dropship" },
              ]}
            />
            <Select value={savedView} onValueChange={(v) => setSavedView(v ?? "all")} items={savedViewItems}>
              <SelectTrigger size="sm" className="w-[190px]">
                <SelectValue placeholder="Saved views" />
              </SelectTrigger>
              <SelectContent>
                {SAVED_VIEWS.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportCsv(filteredRows)}>
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </>
        )}
        bulkActions={(table) => {
          const selectedIds = table.getFilteredSelectedRowModel().rows.map((r) => r.original.product.id);
          return (
            <>
              <Select onValueChange={(v) => v && bulkUpdateStatus(selectedIds, v as ProductStatus)} items={statusItems}>
                <SelectTrigger size="sm" className="w-[150px]">
                  <SelectValue placeholder="Set status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(v) => v && bulkUpdateVisibility(selectedIds, v as ProductVisibility)} items={visibilityItems}>
                <SelectTrigger size="sm" className="w-[150px]">
                  <SelectValue placeholder="Set visibility..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => exportCsv(selectedIds.map((id) => rowsById.get(id)!).filter(Boolean))}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => setPendingDelete(selectedIds)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          );
        }}
      />

      <ProductDetailPanel
        open={detailOpen}
        row={detailRow}
        onOpenChange={setDetailOpen}
        onUpdate={(id, patch) => updateMeta(id, patch)}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.length} product{pendingDelete && pendingDelete.length === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the selected products from your catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                const result = await deleteProductsAction(pendingDelete);
                if (result.error) {
                  toast.error(result.error);
                  setPendingDelete(null);
                  return;
                }
                setRows((prev) => prev.filter((r) => !pendingDelete.includes(r.product.id)));
                toast.success(`Deleted ${pendingDelete.length} product${pendingDelete.length === 1 ? "" : "s"}`);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
