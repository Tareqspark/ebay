import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CollectionsTable } from "@/components/admin/collections/collections-table";
import { getCollections } from "@/lib/admin/collections";

export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const collections = await getCollections();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Collections"
        description="Curated and rule-based groupings used to power storefront rails and landing pages."
      />
      <CollectionsTable collections={collections} />
    </div>
  );
}
