"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
import { ProductFormDialog, type CategoryNode } from "@/components/admin/products/product-form-dialog";
import {
  createProductAction,
  type CreateProductInput,
  updateProductPriceAction,
  updateProductCostAction,
  setProductStatusAction,
  setProductVisibilityAction,
  deleteProductsAction,
} from "@/lib/admin/product-actions";
import type { AdminProductRow } from "@/lib/admin/data";
import type { ProductStatus, ProductVisibility } from "@/lib/admin/types";
import { neutralizeCsvCell } from "@/lib/sanitize";

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
  categoryTree: CategoryNode[];
  brandOptions: { value: string; label: string }[];
  /** Seeds the search box, so a ?q= deep link lands pre-filtered. */
  initialQuery?: string;
  /** Opens the create dialog straight away, for the command palette's "Create product" entry. */
  openNew?: boolean;
}

export function ProductsTable({ initialRows, categoryOptions, categoryTree, brandOptions, initialQuery, openNew }: ProductsTableProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(openNew ?? false);
  const [creating, setCreating] = useState(false);

  async function handleCreate(input: CreateProductInput) {
    setCreating(true);
    const result = await createProductAction(input);
    setCreating(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`"${input.title.trim()}" created`);
    setCreateOpen(false);
    router.refresh();
  }

  const [rows, setRows] = useState(initialRows);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialQuery ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery ?? "");
  const [status, setStatus] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("all");
  const [savedView, setSavedView] = useState("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Filtering, sorting and paging all happen in SQL now — the browser holds
  // one page instead of the whole catalog. Any change to the query resets to
  // page one, since page 8 of the previous filter is meaningless.
  const fetchPage = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage + 1),
          pageSize: String(pageSize),
          q: debouncedSearch,
          status,
          visibility,
          category,
          source,
          savedView,
        });
        const res = await fetch(`/api/admin/products/list?${params}`);
        const data = await res.json();
        setRows(data.rows ?? []);
        setTotal(data.total ?? 0);
        setPageCount(data.pageCount ?? 1);
      } catch {
        toast.error("Couldn't load products — please try again.");
      } finally {
        setLoading(false);
      }
    },
    [pageSize, debouncedSearch, status, visibility, category, source, savedView]
  );

  useEffect(() => {
    setPageIndex(0);
    fetchPage(0);
  }, [fetchPage]);

  const rowsById = useMemo(() => new Map(rows.map((r) => [r.product.id, r])), [rows]);
  const detailRow = detailProductId ? rowsById.get(detailProductId) ?? null : null;

  // `rows` is already the filtered page the server returned.
  const filteredRows = rows;

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

  /**
   * Exports everything matching the current filters, not just the page on
   * screen. Paging made that distinction real: without this the button would
   * quietly produce a 25-row file and look like it had worked.
   */
  async function exportAllMatching() {
    const params = new URLSearchParams({
      page: "1",
      pageSize: "10000",
      q: debouncedSearch,
      status,
      visibility,
      category,
      source,
      savedView,
    });
    try {
      const res = await fetch(`/api/admin/products/list?${params}`);
      const data = await res.json();
      exportCsv(data.rows ?? []);
    } catch {
      toast.error("Couldn't build the export — please try again.");
    }
  }

  function exportCsv(exportRows: AdminProductRow[]) {
    const header = ["Title", "Category", "Price", "Cost", "Margin %", "Inventory", "Supplier", "Status", "Visibility"];
    const lines = exportRows.map((r) =>
      [
        neutralizeCsvCell(r.product.title),
        neutralizeCsvCell(r.categoryName),
        r.product.price.toFixed(2),
        r.meta.cost.toFixed(2),
        r.marginPercent.toFixed(1),
        r.product.stock,
        neutralizeCsvCell(r.supplierName),
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
    a.download = `cartebay-products-${new Date().toISOString().slice(0, 10)}.csv`;
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
        initialGlobalFilter={initialQuery}
        getRowId={(r) => r.product.id}
        onRowClick={(r) => {
          setDetailProductId(r.product.id);
          setDetailOpen(true);
        }}
        emptyMessage={loading ? "Loading..." : "No products match these filters."}
        serverPagination={{
          pageIndex,
          pageCount,
          rowCount: total,
          onPageChange: (i) => {
            setPageIndex(i);
            fetchPage(i);
          },
          onPageSizeChange: setPageSize,
          loading,
        }}
        toolbar={() => (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-8 w-[220px] pl-8"
              />
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              New product
            </Button>
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
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportAllMatching}>
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

      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categoryTree={categoryTree}
        brandOptions={brandOptions}
        onSubmit={handleCreate}
        submitting={creating}
      />

      <ProductDetailPanel
        open={detailOpen}
        row={detailRow}
        onOpenChange={setDetailOpen}
        onUpdate={(id, patch) => updateMeta(id, patch)}
        // Rows are held client-side from a paged query, so router.refresh()
        // alone wouldn't show the edit — refetch the page being viewed. A
        // recategorised product may also drop out of the current filter,
        // which is correct and only visible after a refetch.
        onSaved={() => fetchPage(pageIndex)}
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
