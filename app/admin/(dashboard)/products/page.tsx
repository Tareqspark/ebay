import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductsTable } from "@/components/admin/products/products-table";
import { getAdminProductTableRows, getAdminCategories } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Products" };

interface AdminProductsPageProps {
  /** ?q= lets other screens deep-link to a product, e.g. the inventory list's low-stock rows. */
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const [{ q }, rows, categories] = await Promise.all([searchParams, getAdminProductTableRows(), getAdminCategories()]);
  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products"
        description={`${rows.length.toLocaleString()} products across ${categories.length} categories`}
      />
      <ProductsTable initialRows={rows} categoryOptions={categoryOptions} initialQuery={q} />
    </div>
  );
}
