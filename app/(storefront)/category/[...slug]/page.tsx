import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryBreadcrumb } from "@/components/category/category-breadcrumb";
import { CategoryHero } from "@/components/category/category-hero";
import { SubcategoryGrid, type SubcategoryGridItem } from "@/components/category/subcategory-grid";
import { FeaturedCollections, type FeaturedCollectionItem } from "@/components/category/featured-collections";
import { BrandsRow } from "@/components/category/brands-row";
import { ProductExplorer } from "@/components/product/product-explorer";
import { BannerSlot } from "@/components/storefront/banner-slot";
import { categoryHref, resolveCategoryPath } from "@/lib/category-utils";
import { getBrandsForCategory } from "@/lib/brands";
import { browseCategory, parseExplorerParams, toExplorerState } from "@/lib/products";

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveCategoryPath(slug);
  if (!resolved) return { title: "Category Not Found" };

  const current = resolved.grandchild ?? resolved.child ?? resolved.top;
  return {
    title: current.name,
    description: `Shop ${current.name} at Cartebay. ${resolved.top.description}`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const resolved = await resolveCategoryPath(slug);
  if (!resolved) notFound();

  const { top, child, grandchild, breadcrumbs } = resolved;
  const current = grandchild ?? child ?? top;

  // One page of products, filtered and counted in SQL. The page used to load
  // the entire department — 3,629 products and 5.8MB on Pet Supplies — to show
  // the 24 that fit on screen.
  const explorerParams = parseExplorerParams(sp);
  const result = await browseCategory(slug, explorerParams);

  let subcategoryTitle = "Shop by Subcategory";
  let subItems: SubcategoryGridItem[] = [];

  if (!child) {
    subItems = top.children.map((c) => ({
      id: c.id,
      name: c.name,
      href: categoryHref(top.slug, c.slug),
      imageSeed: c.slug,
      image: c.image,
    }));
  } else if (!grandchild) {
    subcategoryTitle = `Shop ${child.name} by Type`;
    subItems = child.children.map((gc) => ({
      id: gc.id,
      name: gc.name,
      href: categoryHref(top.slug, child.slug, gc.slug),
      imageSeed: gc.slug,
      image: gc.image,
    }));
  } else {
    subcategoryTitle = `More in ${child.name}`;
    subItems = child.children
      .filter((gc) => gc.slug !== grandchild.slug)
      .map((gc) => ({
        id: gc.id,
        name: gc.name,
        href: categoryHref(top.slug, child.slug, gc.slug),
        imageSeed: gc.slug,
        image: gc.image,
      }));
  }

  const featuredItems: FeaturedCollectionItem[] = subItems.slice(0, 3).map((item) => ({
    id: item.id,
    name: item.name,
    href: item.href,
    imageSeed: item.imageSeed,
    image: item.image,
    tagline: `${top.name} Essentials`,
  }));

  const brandOptions = result.brands.length > 0 ? result.brands : await getBrandsForCategory(top.slug);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8">
      <CategoryBreadcrumb items={breadcrumbs} />

      <CategoryHero
        title={current.name}
        description={grandchild || child ? `Explore top-rated ${current.name.toLowerCase()} from trusted brands.` : top.description}
        image={top.image}
        productCount={result.totalInCategory}
      />

      <BannerSlot placement="category-top" />

      <SubcategoryGrid title={subcategoryTitle} items={subItems} />

      <FeaturedCollections items={featuredItems} />

      <BrandsRow brands={brandOptions} />

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
          {result.totalInCategory.toLocaleString()} Products in {current.name}
        </h2>
        <ProductExplorer
          products={result.products}
          brands={brandOptions}
          bounds={result.bounds}
          total={result.total}
          pageCount={result.pageCount}
          state={toExplorerState(explorerParams, result)}
        />
      </section>
    </div>
  );
}
