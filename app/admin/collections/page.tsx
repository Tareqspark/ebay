import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { CollectionsTable } from "@/components/admin/collections/collections-table";
import { COLLECTIONS } from "@/lib/admin/collections";

export const metadata: Metadata = { title: "Collections" };

export default function AdminCollectionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Collections"
        description="Curated and rule-based groupings used to power storefront rails and landing pages."
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New collection
          </Button>
        }
      />
      <CollectionsTable collections={COLLECTIONS} />
    </div>
  );
}
