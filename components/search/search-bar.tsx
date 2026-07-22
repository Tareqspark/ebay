"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { POPULAR_SEARCHES } from "@/lib/category-client";
import type { CategorySearchResult, ClientCategory } from "@/lib/category-utils";

interface SearchBarProps {
  className?: string;
  featuredCategories: ClientCategory[];
  allCategories: { slug: string; name: string }[];
}

export function SearchBar({ className, featuredCategories, allCategories }: SearchBarProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CategorySearchResult[]>([]);
  const { searches, addSearch, removeSearch } = useRecentSearches();

  const categoryScopeItems: Record<string, string> = { all: "All Categories" };
  for (const c of allCategories) categoryScopeItems[c.slug] = c.name;

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/categories/search?q=${encodeURIComponent(query)}&limit=7`);
      const data = await res.json();
      setSuggestions(data.results ?? []);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    addSearch(trimmed);
    setQuery(trimmed);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}${scope !== "all" ? `&category=${scope}` : ""}`);
  }

  const showPanel = open;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
        className="flex h-11 w-full items-stretch overflow-hidden rounded-lg border border-border bg-background shadow-sm ring-primary/20 focus-within:ring-2"
      >
        <Select value={scope} onValueChange={(v) => setScope(v ?? "all")} items={categoryScopeItems}>
          <SelectTrigger className="hidden w-[168px] shrink-0 rounded-none border-0 border-r border-border bg-muted/50 text-xs font-medium sm:flex">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search for products, brands, and categories..."
          aria-label="Search"
          autoComplete="off"
          suppressHydrationWarning
          className="min-w-0 flex-1 bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="flex items-center px-2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          className="flex w-12 shrink-0 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
          aria-label="Submit search"
        >
          <Search className="h-4.5 w-4.5" />
        </button>
      </form>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-popover p-4 shadow-xl">
          {query ? (
            <div className="flex flex-col gap-1">
              {suggestions.length > 0 ? (
                <>
                  <p className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Suggestions
                  </p>
                  {suggestions.map((s) => (
                    <Link
                      key={s.id}
                      href={s.href}
                      onClick={() => {
                        addSearch(s.name);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{s.name}</span>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {s.breadcrumb.slice(0, -1).join(" / ")}
                      </span>
                    </Link>
                  ))}
                </>
              ) : (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No matches for &ldquo;{query}&rdquo;. Press Enter to search anyway.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {searches.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Recent Searches
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 px-1">
                    {searches.map((s) => (
                      <span
                        key={s}
                        className="group flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                      >
                        <button type="button" onClick={() => submitSearch(s)} className="hover:underline">
                          {s}
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${s}`}
                          onClick={() => removeSearch(s)}
                          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2 px-1">
                  {POPULAR_SEARCHES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submitSearch(s)}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Suggested Categories
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {featuredCategories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md border border-border/70 px-2.5 py-2 text-xs text-foreground hover:border-primary hover:bg-primary/5"
                    >
                      {c.iconNode}
                      <span className="truncate">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
