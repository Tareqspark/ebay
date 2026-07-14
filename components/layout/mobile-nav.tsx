"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CategoryTree } from "@/components/category/category-tree";
import { buildCategoryTree, searchCategories } from "@/lib/category-utils";

const tree = buildCategoryTree();

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query ? searchCategories(query, 30) : []), [query]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle>Browse Categories</SheetTitle>
        </SheetHeader>

        <div className="relative border-b border-border px-4 py-3">
          <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories..."
            className="h-9 w-full rounded-md border border-border bg-muted/40 pl-8 pr-8 text-sm outline-none focus:border-primary"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {query ? (
            <div className="flex flex-col">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No categories found for &ldquo;{query}&rdquo;
                </p>
              )}
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={r.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col rounded-md px-3 py-2 hover:bg-muted"
                >
                  <span className="text-sm text-foreground">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.breadcrumb.join(" / ")}</span>
                </Link>
              ))}
            </div>
          ) : (
            <CategoryTree nodes={tree} className="px-1" onNavigate={() => setOpen(false)} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
