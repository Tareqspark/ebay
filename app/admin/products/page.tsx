import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductsTable } from "@/components/admin/products/products-table";
import { getAdminProductTableRows, CATEGORIES } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  const rows = getAdminProductTableRows();
  const categoryOptions = CATEGORIES.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products"
        description={`${rows.length.toLocaleString()} products across ${CATEGORIES.length} categories`}
      />
      <ProductsTable initialRows={rows} categoryOptions={categoryOptions} />
    </div>
  );
}
