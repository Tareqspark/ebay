import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryBreadcrumb } from "@/components/category/category-breadcrumb";
import { CategoryHero } from "@/components/category/category-hero";
import { SubcategoryGrid, type SubcategoryGridItem } from "@/components/category/subcategory-grid";
import { FeaturedCollections, type FeaturedCollectionItem } from "@/components/category/featured-collections";
import { BrandsRow } from "@/components/category/brands-row";
import { ProductExplorer } from "@/components/product/product-explorer";
import { categoryHref, resolveCategoryPath } from "@/lib/category-utils";
import { getBrandsForCategory } from "@/lib/brands";
import { getBrandsInProducts, getProductsByCategoryPath } from "@/lib/products";

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveCategoryPath(slug);
  if (!resolved) return { title: "Category Not Found" };

  const current = resolved.grandchild ?? resolved.child ?? resolved.top;
  return {
    title: current.name,
    description: `Shop ${current.name} at Baruashop. ${resolved.top.description}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const resolved = await resolveCategoryPath(slug);
  if (!resolved) notFound();

  const { top, child, grandchild, breadcrumbs } = resolved;
  const current = grandchild ?? child ?? top;
  const products = await getProductsByCategoryPath(slug);

  let subcategoryTitle = "Shop by Subcategory";
  let subItems: SubcategoryGridItem[] = [];

  if (!child) {
    subItems = top.children.map((c) => ({
      id: c.id,
      name: c.name,
      href: categoryHref(top.slug, c.slug),
      imageSeed: c.slug,
    }));
  } else if (!grandchild) {
    subcategoryTitle = `Shop ${child.name} by Type`;
    subItems = child.children.map((gc) => ({
      id: gc.id,
      name: gc.name,
      href: categoryHref(top.slug, child.slug, gc.slug),
      imageSeed: gc.slug,
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
      }));
  }

  const featuredItems: FeaturedCollectionItem[] = subItems.slice(0, 3).map((item) => ({
    id: item.id,
    name: item.name,
    href: item.href,
    imageSeed: item.imageSeed,
    tagline: `${top.name} Essentials`,
  }));

  const brands = await getBrandsInProducts(products);
  const brandOptions = brands.length > 0 ? brands : await getBrandsForCategory(top.slug);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8">
      <CategoryBreadcrumb items={breadcrumbs} />

      <CategoryHero
        title={current.name}
        description={grandchild || child ? `Explore top-rated ${current.name.toLowerCase()} from trusted brands.` : top.description}
        image={top.image}
        productCount={products.length}
      />

      <SubcategoryGrid title={subcategoryTitle} items={subItems} />

      <FeaturedCollections items={featuredItems} />

      <BrandsRow brands={brandOptions} />

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
          {products.length.toLocaleString()} Products in {current.name}
        </h2>
        <ProductExplorer products={products} brands={brandOptions} />
      </section>
    </div>
  );
}
