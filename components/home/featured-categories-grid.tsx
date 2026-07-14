import Image from "next/image";
import Link from "next/link";
import { categoryHref } from "@/lib/category-utils";
import type { Category } from "@/app/data/categories";

export function FeaturedCategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={categoryHref(category.slug)}
              className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
                <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-primary shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-1 text-sm font-medium text-foreground">{category.name}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
