"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categoryHref, type ClientCategory } from "@/lib/category-utils";
import { MegaMenuPanel } from "@/components/layout/mega-menu-panel";
import { cn } from "@/lib/utils";
import type { Brand } from "@/lib/types";

interface AllCategoriesPanelProps {
  categories: ClientCategory[];
  brandsBySlug: Record<string, Brand[]>;
  onNavigate?: () => void;
}

export function AllCategoriesPanel({ categories, brandsBySlug, onNavigate }: AllCategoriesPanelProps) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug);
  const active = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  return (
    <div className="grid grid-cols-[240px_1fr] divide-x divide-border">
      <div className="max-h-[560px] overflow-y-auto py-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={categoryHref(category.slug)}
            onMouseEnter={() => setActiveSlug(category.slug)}
            onFocus={() => setActiveSlug(category.slug)}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors",
              activeSlug === category.slug ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
            )}
          >
            <span className="flex items-center gap-2.5">
              {category.iconNode}
              <span className="truncate">{category.name}</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </Link>
        ))}
      </div>
      <div className="max-h-[560px] overflow-y-auto">
        {active && <MegaMenuPanel category={active} brands={brandsBySlug[active.slug] ?? []} onNavigate={onNavigate} />}
      </div>
    </div>
  );
}
