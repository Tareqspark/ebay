import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ContentTable } from "@/components/admin/content/content-table";
import { getContentItems } from "@/lib/admin/content";

export const metadata: Metadata = { title: "Content" };

export default async function AdminContentPage() {
  const items = await getContentItems();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Content" description="Storefront pages, banners, and hero slides" />
      <ContentTable items={items} />
    </div>
  );
}
