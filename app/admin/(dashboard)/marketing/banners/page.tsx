import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { BannersTable } from "@/components/admin/banners/banners-table";
import { getBanners } from "@/lib/admin/banners";
import { getAdminCategories } from "@/lib/admin/data";
import { getCollections } from "@/lib/admin/collections";

export const metadata: Metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const [banners, categories, collections] = await Promise.all([getBanners(), getAdminCategories(), getCollections()]);

  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));
  // Only collections with a slug can be linked — a slug is what the
  // storefront route resolves, so one without it has no reachable page.
  const collectionOptions = collections
    .filter((c) => c.slug)
    .map((c) => ({ value: c.slug!, label: c.name }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Banners"
        description="Promotional banner ads placed in fixed slots across the storefront."
      />
      <BannersTable banners={banners} categoryOptions={categoryOptions} collectionOptions={collectionOptions} />
    </div>
  );
}
