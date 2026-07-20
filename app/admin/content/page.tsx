import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { ContentTable } from "@/components/admin/content/content-table";
import { CONTENT_ITEMS } from "@/lib/admin/content";

export const metadata: Metadata = { title: "Content" };

export default function AdminContentPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Content"
        description="Storefront pages, banners, and hero slides"
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New content
          </Button>
        }
      />
      <ContentTable items={CONTENT_ITEMS} />
    </div>
  );
}
