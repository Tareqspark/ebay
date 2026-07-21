import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CjTabs } from "@/components/admin/cj/cj-tabs";
import { CjCatalogTable } from "@/components/admin/cj/cj-catalog-table";
import { getAdminCategories, getCjShippingLines } from "@/lib/admin/data";
import { getCjCatalogTotal } from "@/lib/admin/cj-catalog";

export const metadata: Metadata = { title: "CJ Catalog" };

export default async function AdminCjCatalogPage() {
  const [categories, shippingLines] = await Promise.all([getAdminCategories(), getCjShippingLines()]);
  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));
  const total = getCjCatalogTotal();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="CJdropshipping"
        description={`Browse and import from CJdropshipping's live catalog — ${total.toLocaleString()} products available`}
      />
      <CjTabs />
      <CjCatalogTable categoryOptions={categoryOptions} shippingLines={shippingLines} />
    </div>
  );
}
