import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductsTable } from "@/components/admin/products/products-table";
import { getAdminProductTableRows, getAdminCategories } from "@/lib/admin/data";
import { getAllBrands } from "@/lib/brands";

export const metadata: Metadata = { title: "Products" };

interface AdminProductsPageProps {
  /** ?q= lets other screens deep-link to a product, e.g. the inventory list's low-stock rows. */
  searchParams: Promise<{ q?: string; new?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const [{ q, new: isNew }, rows, categories, brands] = await Promise.all([
    searchParams,
    getAdminProductTableRows(),
    getAdminCategories(),
    getAllBrands(),
  ]);
  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));
  // Full three-level tree for the create form's cascading picker; a product's
  // categorySlugPath must name all three levels to match the storefront routes.
  const categoryTree = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    children: c.children.map((child) => ({
      name: child.name,
      slug: child.slug,
      children: child.children.map((leaf) => ({ name: leaf.name, slug: leaf.slug })),
    })),
  }));
  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products"
        description={`${rows.length.toLocaleString()} products across ${categories.length} categories`}
      />
      <ProductsTable
        initialRows={rows}
        categoryOptions={categoryOptions}
        categoryTree={categoryTree}
        brandOptions={brandOptions}
        initialQuery={q}
        openNew={isNew === "1"}
      />
    </div>
  );
}
