"use client";

import Link from "next/link";
import { LayoutGrid, Percent } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { AllCategoriesPanel } from "@/components/layout/all-categories-panel";
import { MegaMenuPanel } from "@/components/layout/mega-menu-panel";
import type { ClientCategory } from "@/lib/category-utils";
import type { Brand } from "@/lib/types";

interface NavMegaMenuProps {
  categories: ClientCategory[];
  brandsBySlug: Record<string, Brand[]>;
}

export function NavMegaMenu({ categories, brandsBySlug }: NavMegaMenuProps) {
  const quickCategories = categories.filter((c) => c.featured).slice(0, 10);

  return (
    <div className="hidden border-b border-border/70 bg-background lg:block">
      <div className="mx-auto max-w-[1440px] px-6">
        <NavigationMenu className="max-w-none justify-start" align="start">
          <NavigationMenuList className="justify-start gap-0.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="gap-1.5 font-semibold">
                <LayoutGrid className="h-4 w-4" />
                All Categories
              </NavigationMenuTrigger>
              <NavigationMenuContent className="!w-[880px]">
                <AllCategoriesPanel categories={categories} brandsBySlug={brandsBySlug} />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {quickCategories.map((category) => (
              <NavigationMenuItem key={category.id}>
                <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
                <NavigationMenuContent className="!w-[760px]">
                  <MegaMenuPanel category={category} brands={brandsBySlug[category.slug] ?? []} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem>
              <Link
                href="/#deals"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Percent className="h-4 w-4" />
                Today&apos;s Deals
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
