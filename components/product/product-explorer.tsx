"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import type { SortKey } from "@/lib/products-client";
import type { Brand, Product } from "@/lib/types";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Best Match" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Newest Arrivals" },
];
const sortItems: Record<string, string> = Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, o.label]));

/** The filter state, exactly as it appears in the URL. */
export interface ExplorerState {
  brandIds: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sort: SortKey;
  page: number;
}

interface ProductExplorerProps {
  /** Only the current page of products — the rest stay on the server. */
  products: Product[];
  brands: Brand[];
  bounds: { min: number; max: number };
  total: number;
  pageCount: number;
  state: ExplorerState;
}

export function ProductExplorer({ products, brands, bounds, total, pageCount, state }: ProductExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // The slider tracks the drag locally so it stays smooth; only the released
  // value is committed to the URL, which is what triggers a server round trip.
  const [priceDraft, setPriceDraft] = useState<[number, number]>([state.minPrice, state.maxPrice]);

  /**
   * Filters live in the URL rather than component state so a filtered view can
   * be linked, shared and reloaded, and so the server can do the filtering
   * against the whole category instead of one page of it.
   */
  function apply(next: Partial<ExplorerState>) {
    const merged = { ...state, ...next };
    // Any change other than paging returns to page 1 — page 7 of a narrower
    // result set is usually empty.
    if (next.page === undefined) merged.page = 1;

    const params = new URLSearchParams();
    if (merged.brandIds.length) params.set("brands", merged.brandIds.join(","));
    if (merged.minPrice > bounds.min) params.set("min", String(merged.minPrice));
    if (merged.maxPrice < bounds.max) params.set("max", String(merged.maxPrice));
    if (merged.minRating > 0) params.set("rating", String(merged.minRating));
    if (merged.sort !== "relevance") params.set("sort", merged.sort);
    if (merged.page > 1) params.set("page", String(merged.page));

    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function toggleBrand(id: string) {
    apply({
      brandIds: state.brandIds.includes(id)
        ? state.brandIds.filter((b) => b !== id)
        : [...state.brandIds, id],
    });
  }

  function resetFilters() {
    setPriceDraft([bounds.min, bounds.max]);
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  const hasActiveFilters =
    state.brandIds.length > 0 ||
    state.minRating > 0 ||
    state.minPrice > bounds.min ||
    state.maxPrice < bounds.max;

  const filterPanel = (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Price</h3>
        </div>
        <Slider
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={priceDraft}
          onValueChange={(v) => {
            const [low, high] = Array.isArray(v) ? v : [v, v];
            setPriceDraft([low, high]);
          }}
          onValueCommitted={(v) => {
            const [low, high] = Array.isArray(v) ? v : [v, v];
            apply({ minPrice: low, maxPrice: high });
          }}
        />
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceDraft[0])}</span>
          <span>{formatPrice(priceDraft[1])}</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Customer Rating</h3>
        <div className="flex flex-col gap-2">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => apply({ minRating: state.minRating === r ? 0 : r })}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm transition-colors ${
                state.minRating === r ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {r}+ Stars
            </button>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Brand</h3>
            <div className="flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={state.brandIds.includes(brand.id)}
                    onCheckedChange={() => toggleBrand(brand.id)}
                  />
                  <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal text-foreground">
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="justify-start gap-1.5 px-2">
          <X className="h-3.5 w-3.5" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  // A window of page numbers around the current one — 500-page categories
  // cannot render a link per page.
  const windowStart = Math.max(1, Math.min(state.page - 2, pageCount - 4));
  const windowEnd = Math.min(pageCount, windowStart + 4);
  const pageNumbers: number[] = [];
  for (let p = windowStart; p <= windowEnd; p++) pageNumbers.push(p);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-border/80 bg-card p-5">{filterPanel}</div>
      </aside>

      <div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{total.toLocaleString()}</span> results
            {pageCount > 1 && (
              <span className="ml-1">
                · page {state.page} of {pageCount}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5 lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                }
              />
              <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto p-5">
                <SheetHeader className="mb-2 px-0">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                {filterPanel}
              </SheetContent>
            </Sheet>
            <Select
              value={state.sort}
              onValueChange={(v) => apply({ sort: (v as SortKey) ?? "relevance" })}
              items={sortItems}
            >
              <SelectTrigger className="h-9 w-[180px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <p className="text-sm font-medium text-foreground">No products match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting or clearing your filters.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 xl:grid-cols-4 ${
              isPending ? "opacity-60" : ""
            }`}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              disabled={state.page <= 1 || isPending}
              onClick={() => apply({ page: state.page - 1 })}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {windowStart > 1 && (
              <>
                <Button variant="ghost" size="sm" onClick={() => apply({ page: 1 })} disabled={isPending}>
                  1
                </Button>
                <span className="px-1 text-muted-foreground">…</span>
              </>
            )}

            {pageNumbers.map((p) => (
              <Button
                key={p}
                variant={p === state.page ? "default" : "ghost"}
                size="sm"
                onClick={() => apply({ page: p })}
                disabled={isPending}
                aria-current={p === state.page ? "page" : undefined}
              >
                {p}
              </Button>
            ))}

            {windowEnd < pageCount && (
              <>
                <span className="px-1 text-muted-foreground">…</span>
                <Button variant="ghost" size="sm" onClick={() => apply({ page: pageCount })} disabled={isPending}>
                  {pageCount}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="icon"
              disabled={state.page >= pageCount || isPending}
              onClick={() => apply({ page: state.page + 1 })}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
