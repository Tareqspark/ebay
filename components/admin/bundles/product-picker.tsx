"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/admin/format";

interface PickerProduct {
  id: string;
  title: string;
  image: string;
  price: number;
}

interface ProductPickerProps {
  selected: PickerProduct[];
  onChange: (products: PickerProduct[]) => void;
}

export function ProductPicker({ selected, onChange }: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickerProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/admin/products/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setResults(data.products ?? []);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const selectedIds = new Set(selected.map((p) => p.id));

  function addProduct(product: PickerProduct) {
    if (selectedIds.has(product.id)) return;
    onChange([...selected, product]);
    setQuery("");
    setResults([]);
  }

  function removeProduct(id: string) {
    onChange(selected.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products to add..."
          className="pl-8"
        />
      </div>
      {query.trim().length >= 2 && (
        <div className="max-h-48 overflow-y-auto rounded-md border border-border">
          {loading ? (
            <p className="p-3 text-xs text-muted-foreground">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">No products match &ldquo;{query}&rdquo;.</p>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product)}
                disabled={selectedIds.has(product.id)}
                className="flex w-full items-center gap-2.5 border-b border-border/60 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-border bg-muted">
                  <Image src={product.image} alt="" fill sizes="32px" className="object-cover" />
                </div>
                <span className="min-w-0 flex-1 truncate text-foreground">{product.title}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{formatMoney(product.price)}</span>
              </button>
            ))
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-md border border-border p-2">
          {selected.map((product) => (
            <div key={product.id} className="flex items-center gap-2.5 text-sm">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-border bg-muted">
                <Image src={product.image} alt="" fill sizes="32px" className="object-cover" />
              </div>
              <span className="min-w-0 flex-1 truncate text-foreground">{product.title}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{formatMoney(product.price)}</span>
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                aria-label={`Remove ${product.title}`}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
