import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryHref } from "@/lib/category-client";
import type { ClientCategory } from "@/lib/category-utils";
import type { Brand } from "@/lib/types";

interface MegaMenuPanelProps {
  category: ClientCategory;
  brands: Brand[];
  onNavigate?: () => void;
}

/**
 * Leaves shown under each subcategory before collapsing into a "+N more"
 * link. A cap is needed — one subcategory has 13 leaves and 171 have more
 * than five, so rendering every leaf would make the panel enormous — but it
 * has to be visible, not silent.
 */
const LEAVES_SHOWN = 5;

export function MegaMenuPanel({ category, brands, onNavigate }: MegaMenuPanelProps) {
  /**
   * Every subcategory, not the first six.
   *
   * The old slice(0, 6) silently dropped the rest, and 14 of 31 departments
   * have more than six — "Toys for Babies" was the 7th of Kids' & Baby's
   * eight and so was unreachable from this menu entirely, despite having a
   * live category page and a product in it. The widest department has nine,
   * which is three rows of this grid, and the panel already scrolls.
   */
  const visibleChildren = category.children;

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
                {child.children.slice(0, LEAVES_SHOWN).map((gc) => (
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
                {child.children.length > LEAVES_SHOWN && (
                  <li>
                    <Link
                      href={categoryHref(category.slug, child.slug)}
                      onClick={onNavigate}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      +{child.children.length - LEAVES_SHOWN} more
                    </Link>
                  </li>
                )}
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
