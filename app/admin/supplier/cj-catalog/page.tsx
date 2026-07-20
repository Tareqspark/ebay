import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { CjCatalogTable } from "@/components/admin/cj/cj-catalog-table";
import { CATEGORIES, CJ_SHIPPING_LINES } from "@/lib/admin/data";
import { getCjCatalogTotal } from "@/lib/admin/cj-catalog";

export const metadata: Metadata = { title: "CJ Catalog" };

export default function AdminCjCatalogPage() {
  const categoryOptions = CATEGORIES.map((c) => ({ value: c.slug, label: c.name }));
  const total = getCjCatalogTotal();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Supplier"
        description={`Browse and import from CJdropshipping's live catalog — ${total.toLocaleString()} products available`}
      />
      <SupplierTabs />
      <CjCatalogTable categoryOptions={categoryOptions} shippingLines={CJ_SHIPPING_LINES} />
    </div>
  );
}
