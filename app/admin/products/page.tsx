import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductsTable } from "@/components/admin/products/products-table";
import { getAdminProductTableRows, getAdminCategories } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const [rows, categories] = await Promise.all([getAdminProductTableRows(), getAdminCategories()]);
  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products"
        description={`${rows.length.toLocaleString()} products across ${categories.length} categories`}
      />
      <ProductsTable initialRows={rows} categoryOptions={categoryOptions} />
    </div>
  );
}
