"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { formatMoney, formatNumber } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { CjCatalogItem } from "@/lib/admin/cj-types";
import type { CjShippingLine } from "@/lib/admin/cj-types";

interface CjCatalogTableProps {
  categoryOptions: { value: string; label: string }[];
  shippingLines: CjShippingLine[];
}

interface ApiResult {
  items: CjCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

const PAGE_SIZE = 25;

export function CjCatalogTable({ categoryOptions, shippingLines }: CjCatalogTableProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [hideImported, setHideImported] = useState(false);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const requestId = useRef(0);

  const shippingLineById = useMemo(() => new Map(shippingLines.map((l) => [l.id, l])), [shippingLines]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => setPage(1), [debouncedQuery, category, warehouse, stockStatus, hideImported]);

  const fetchPage = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (category !== "all") params.set("category", category);
    if (warehouse !== "all") params.set("warehouse", warehouse);
    if (stockStatus !== "all") params.set("stockStatus", stockStatus);
    if (hideImported) params.set("hideImported", "1");
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/admin/cj-catalog?${params.toString()}`);
      const data: ApiResult = await res.json();
      if (id === requestId.current) setResult(data);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [debouncedQuery, category, warehouse, stockStatus, hideImported, page]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function importSelected() {
    const ids = [...selected];
    setImportedIds((prev) => new Set([...prev, ...ids]));
    toast.success(`Queued ${ids.length} product${ids.length === 1 ? "" : "s"} for import from CJdropshipping`);
    setSelected(new Set());
  }

  const items = result?.items ?? [];
  const total = result?.total ?? 0;
  const pageCount = result?.pageCount ?? 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CJ catalog by title or product ID..."
            autoComplete="off"
            suppressHydrationWarning
            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <FilterSelect value={category} onChange={setCategory} allLabel="All categories" width="w-[180px]" options={categoryOptions} />
        <FilterSelect
          value={warehouse}
          onChange={setWarehouse}
          allLabel="All warehouses"
          width="w-[170px]"
          options={[
            { value: "CN", label: "China warehouse" },
            { value: "US", label: "US warehouse" },
          ]}
        />
        <FilterSelect
          value={stockStatus}
          onChange={setStockStatus}
          allLabel="All stock"
          width="w-[140px]"
          options={[
            { value: "in_stock", label: "In stock" },
            { value: "low_stock", label: "Low stock" },
            { value: "out_of_stock", label: "Out of stock" },
          ]}
        />
        <button
          type="button"
          onClick={() => setHideImported((v) => !v)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors",
            hideImported ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Hide already-imported
        </button>
        <span className="ml-auto text-xs text-muted-foreground">
          {loading ? "Searching..." : `${formatNumber(total)} of ${formatNumber(50000)} CJ products`}
        </span>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-3 py-2">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <Button size="sm" className="gap-1.5" onClick={importSelected}>
            <Download className="h-3.5 w-3.5" />
            Import to Baruashop
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <div className="relative overflow-auto rounded-lg border border-border bg-card" style={{ maxHeight: "calc(100vh - 340px)" }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-[1] bg-card shadow-[inset_0_-1px_0_0_var(--border)]">
            <tr>
              <Th className="w-9" />
              <Th>Product</Th>
              <Th>Category</Th>
              <Th className="text-right">Cost</Th>
              <Th className="text-right">Suggested retail</Th>
              <Th>Warehouse</Th>
              <Th>Shipping line</Th>
              <Th>Variants</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={10} className="h-32 text-center text-sm text-muted-foreground">
                  No CJ products match these filters.
                </td>
              </tr>
            )}
            {items.map((item) => {
              const line = shippingLineById.get(item.shippingLineId);
              const isImported = item.imported || importedIds.has(item.id);
              return (
                <tr
                  key={item.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                >
                  <td className="px-3 py-2.5">
                    <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleSelect(item.id)} disabled={isImported} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <Image src={item.image} alt="" fill sizes="36px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate text-sm font-medium text-foreground">{item.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">{item.cjProductId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{item.categorySlug.replace(/-/g, " ")}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-foreground">{formatMoney(item.cost)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{formatMoney(item.suggestedRetail)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{item.sourceWarehouse === "CN" ? "China" : "United States"}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {line ? `${line.name} · ${line.estimatedDays}` : "—"}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{item.variantCount}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={item.stockStatus} />
                  </td>
                  <td className="px-3 py-2.5">
                    {isImported ? <StatusBadge status="active" /> : <span className="text-xs text-muted-foreground">Not imported</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Page <span className="font-medium text-foreground">{page}</span> of{" "}
          <span className="font-medium text-foreground">{formatNumber(pageCount)}</span> —{" "}
          <span className="font-medium text-foreground">{formatNumber(total)}</span> results
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground", className)}>
      {children}
    </th>
  );
}
