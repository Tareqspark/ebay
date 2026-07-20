"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
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
import {
  filterProducts,
  getPriceBounds,
  sortProducts,
  type SortKey,
} from "@/lib/products";
import { formatPrice } from "@/lib/format";
import type { Brand, Product } from "@/lib/types";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Best Match" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Newest Arrivals" },
];
const sortItems: Record<string, string> = Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, o.label]));

const PAGE_SIZE = 24;

interface ProductExplorerProps {
  products: Product[];
  brands: Brand[];
}

export function ProductExplorer({ products, brands }: ProductExplorerProps) {
  const bounds = useMemo(() => getPriceBounds(products), [products]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([bounds.min, bounds.max]);
  const [minRating, setMinRating] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("relevance");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const result = filterProducts(products, {
      brandIds: selectedBrandIds.length ? selectedBrandIds : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating: minRating || undefined,
    });
    return sortProducts(result, sortKey);
  }, [products, selectedBrandIds, priceRange, minRating, sortKey]);

  const visible = filtered.slice(0, visibleCount);

  function toggleBrand(id: string) {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
    setVisibleCount(PAGE_SIZE);
  }

  function resetFilters() {
    setSelectedBrandIds([]);
    setPriceRange([bounds.min, bounds.max]);
    setMinRating(0);
    setVisibleCount(PAGE_SIZE);
  }

  const hasActiveFilters =
    selectedBrandIds.length > 0 || minRating > 0 || priceRange[0] !== bounds.min || priceRange[1] !== bounds.max;

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
          value={priceRange}
          onValueChange={(v) => {
            const [low, high] = Array.isArray(v) ? v : [v, v];
            setPriceRange([low, high]);
            setVisibleCount(PAGE_SIZE);
          }}
        />
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Customer Rating</h3>
        <div className="flex flex-col gap-2">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => {
                setMinRating(minRating === r ? 0 : r);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm transition-colors ${
                minRating === r ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
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
                    checked={selectedBrandIds.includes(brand.id)}
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

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-border/80 bg-card p-5">
          {filterPanel}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span> results
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
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)} items={sortItems}>
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

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <p className="text-sm font-medium text-foreground">No products match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting or clearing your filters.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {visibleCount < filtered.length && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
              Load more products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
