"use client";

import { Search, X } from "lucide-react";
import type { Table as TableInstance } from "@tanstack/react-table";

interface TableSearchProps<TData> {
  table: TableInstance<TData>;
  placeholder?: string;
}

export function TableSearch<TData>({ table, placeholder = "Search..." }: TableSearchProps<TData>) {
  const value = (table.getState().globalFilter as string) ?? "";

  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        suppressHydrationWarning
        className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => table.setGlobalFilter("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
