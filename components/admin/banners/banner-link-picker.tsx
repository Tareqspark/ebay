"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  image: string;
}

/**
 * Picks exactly one product and yields its slug, which is what a banner
 * link stores. Distinct from components/admin/bundles/product-picker.tsx —
 * that one is multi-select and returns ids for membership rows. Editing an
 * existing banner shows the stored slug straight away rather than resolving
 * it back into a product first: it's the value that actually matters, and a
 * lookup here would just be a slower way to show the same thing.
 */
export function BannerLinkPicker({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
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

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <p className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-foreground">
          Linked to <span className="font-medium">/product/{value}</span>
        </p>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={value ? "Search to change product..." : "Search for a product..."}
          className="pl-8"
        />
      </div>
      {query.trim().length >= 2 && (
        <div className="max-h-40 overflow-y-auto rounded-md border border-border">
          {loading ? (
            <p className="p-3 text-xs text-muted-foreground">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">No products match &ldquo;{query}&rdquo;.</p>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onChange(product.slug);
                  setQuery("");
                  setResults([]);
                }}
                className="flex w-full items-center gap-2.5 border-b border-border/60 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
              >
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-border bg-muted">
                  <Image src={product.image} alt="" fill sizes="32px" className="object-cover" />
                </div>
                <span className="min-w-0 flex-1 truncate text-foreground">{product.title}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
