import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryHref, type ClientCategory } from "@/lib/category-utils";
import type { Brand } from "@/lib/types";

interface MegaMenuPanelProps {
  category: ClientCategory;
  brands: Brand[];
  onNavigate?: () => void;
}

export function MegaMenuPanel({ category, brands, onNavigate }: MegaMenuPanelProps) {
  const visibleChildren = category.children.slice(0, 6);

  return (
    <div className="grid grid-cols-[1fr_280px] gap-8 p-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={categoryHref(category.slug)}
            onClick={onNavigate}
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Shop all {category.name}
          </Link>
          <Link
            href={categoryHref(category.slug)}
            onClick={onNavigate}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          {visibleChildren.map((child) => (
            <div key={child.id}>
              <Link
                href={categoryHref(category.slug, child.slug)}
                onClick={onNavigate}
                className="text-xs font-semibold uppercase tracking-wide text-foreground hover:text-primary"
              >
                {child.name}
              </Link>
              <ul className="mt-2 flex flex-col gap-1.5">
                {child.children.slice(0, 5).map((gc) => (
                  <li key={gc.id}>
                    <Link
                      href={categoryHref(category.slug, child.slug, gc.slug)}
                      onClick={onNavigate}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {gc.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {brands.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Popular Brands
            </p>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <span
                  key={brand.id}
                  className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground"
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link
        href={categoryHref(category.slug)}
        onClick={onNavigate}
        className="group relative block overflow-hidden rounded-xl"
      >
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="280px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-sm font-semibold text-white">{category.description}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/90">
            Explore now
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </div>
  );
}
