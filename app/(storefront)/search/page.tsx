import type { Metadata } from "next";
import Link from "next/link";
import { ProductExplorer } from "@/components/product/product-explorer";
import { searchCategories } from "@/lib/category-utils";
import { getBrandsInProducts, searchProducts } from "@/lib/products";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search results for "${q}"` : "Search" };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const products = await searchProducts(q, 200);
  const [categoryMatches, brands] = await Promise.all([searchCategories(q, 6), getBrandsInProducts(products)]);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {q ? (
            <>
              Search results for <span className="text-primary">&ldquo;{q}&rdquo;</span>
            </>
          ) : (
            "Search"
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length.toLocaleString()} products found
        </p>
      </div>

      {categoryMatches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryMatches.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <p className="text-base font-medium text-foreground">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or browse categories from the menu.
          </p>
        </div>
      ) : (
        <ProductExplorer products={products} brands={brands} />
      )}
    </div>
  );
}
