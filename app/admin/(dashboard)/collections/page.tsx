import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CollectionsTable } from "@/components/admin/collections/collections-table";
import { getCollections } from "@/lib/admin/collections";
import { getAdminCategories } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const [collections, categories] = await Promise.all([getCollections(), getAdminCategories()]);
  const topCategoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Collections"
        description="Curated and rule-based groupings used to power storefront rails and landing pages."
      />
      <CollectionsTable collections={collections} topCategoryOptions={topCategoryOptions} />
    </div>
  );
}
