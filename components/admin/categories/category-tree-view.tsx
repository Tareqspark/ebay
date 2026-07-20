"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ExternalLink, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryTreeRow } from "@/lib/admin/categories";

export function CategoryTreeView({ tree }: { tree: CategoryTreeRow[] }) {
  const [query, setQuery] = useState("");

  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;
    function filterNode(node: CategoryTreeRow): CategoryTreeRow | null {
      const matches = node.name.toLowerCase().includes(q);
      const children = node.children.map(filterNode).filter((n): n is CategoryTreeRow => n !== null);
      if (matches || children.length > 0) return { ...node, children };
      return null;
    }
    return tree.map(filterNode).filter((n): n is CategoryTreeRow => n !== null);
  }, [tree, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories..."
          autoComplete="off"
          suppressHydrationWarning
          className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
      <div className="rounded-lg border border-border bg-card">
        <div className="grid grid-cols-[1fr_110px_90px_80px] gap-2 border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Category</span>
          <span className="text-right">Products</span>
          <span>Featured</span>
          <span></span>
        </div>
        <div>
          {filteredTree.map((node) => (
            <CategoryRow key={node.id} node={node} depth={0} forceOpen={query.trim().length > 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ node, depth, forceOpen }: { node: CategoryTreeRow; depth: number; forceOpen: boolean }) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const hasChildren = node.children.length > 0;
  const href = `/category/${node.slugPath.join("/")}`;

  return (
    <div>
      <div
        className="grid grid-cols-[1fr_110px_90px_80px] items-center gap-2 border-b border-border/60 px-3 py-2 text-sm last:border-0 hover:bg-muted/40"
      >
        <div className="flex min-w-0 items-center gap-1" style={{ paddingLeft: `${depth * 18}px` }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={isOpen ? "Collapse" : "Expand"}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }} className="flex">
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.span>
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          <span className={cn("truncate", depth === 0 ? "font-medium text-foreground" : "text-foreground")}>
            {node.name}
          </span>
        </div>
        <span className="text-right tabular-nums text-muted-foreground">{node.productCount.toLocaleString()}</span>
        <span>
          {node.featured && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
        </span>
        <Link
          href={href}
          target="_blank"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          View
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {hasChildren && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {node.children.map((child) => (
                <CategoryRow key={child.id} node={child} depth={depth + 1} forceOpen={forceOpen} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
