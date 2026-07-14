"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/app/data/categories";
import { categoryHref } from "@/lib/category-utils";
import { MegaMenuPanel } from "@/components/layout/mega-menu-panel";
import { cn } from "@/lib/utils";

export function AllCategoriesPanel({ onNavigate }: { onNavigate?: () => void }) {
  const [activeSlug, setActiveSlug] = useState(CATEGORIES[0].slug);
  const active = CATEGORIES.find((c) => c.slug === activeSlug) ?? CATEGORIES[0];

  return (
    <div className="grid grid-cols-[240px_1fr] divide-x divide-border">
      <div className="max-h-[560px] overflow-y-auto py-2">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={categoryHref(category.slug)}
              onMouseEnter={() => setActiveSlug(category.slug)}
              onFocus={() => setActiveSlug(category.slug)}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors",
                activeSlug === category.slug
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{category.name}</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </Link>
          );
        })}
      </div>
      <div className="max-h-[560px] overflow-y-auto">
        <MegaMenuPanel category={active} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
