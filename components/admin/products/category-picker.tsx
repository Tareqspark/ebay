"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeafOption {
  id: string;
  name: string;
  path: string;
  slugPath: [string, string, string];
}

/**
 * Searchable picker for a product's bottom-level category.
 *
 * A plain select is not an option at 1,416 leaves, and shipping them all to
 * the browser would add a six-figure payload to a page that already carries
 * a large table — so results come from /api/admin/categories/leaf-search,
 * which matches on the full "Top > Child > Leaf" path.
 *
 * The current category is shown as text until the admin chooses to change it.
 * Recategorising is a deliberate act, not something to do by mis-clicking a
 * dropdown while reading a product.
 */
export function CategoryPicker({
  value,
  currentPath,
  onChange,
  disabled,
}: {
  value: string;
  currentPath: string;
  onChange: (option: LeafOption) => void;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<LeafOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [chosen, setChosen] = useState<LeafOption | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset when the panel switches to a different product.
    setEditing(false);
    setChosen(null);
    setQuery("");
  }, [value]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    setLoading(true);
    // Debounced: typing a category name would otherwise fire a request per
    // keystroke against a 1,416-row scan.
    const timer = setTimeout(() => {
      fetch(`/api/admin/categories/leaf-search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setOptions(data.options ?? []);
        })
        .catch(() => {
          if (!cancelled) setOptions([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, editing]);

  const shownPath = chosen?.path ?? currentPath;

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground" title={shownPath}>
          {shownPath || "Uncategorised"}
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setEditing(true)}
          className="shrink-0 text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories, e.g. kids stacking"
          autoComplete="off"
          className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        {loading && <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      <div className="max-h-52 overflow-y-auto rounded-md border border-border">
        {options.length === 0 && !loading && (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">No categories match.</p>
        )}
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setChosen(option);
              onChange(option);
              setEditing(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted",
              option.id === value && "bg-primary/10"
            )}
          >
            {option.id === value ? (
              <Check className="h-3 w-3 shrink-0 text-primary" />
            ) : (
              <span className="w-3 shrink-0" />
            )}
            <span className="min-w-0 flex-1 truncate">{option.path}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setEditing(false)}
        className="self-start text-xs text-muted-foreground hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  );
}
