import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { HomepageDealsForm } from "@/components/admin/marketing/homepage-deals-form";
import { getHomepageDealsSelection } from "@/lib/admin/homepage-deals";

export const metadata: Metadata = { title: "Homepage Deals" };

export default async function AdminHomepageDealsPage() {
  const selection = await getHomepageDealsSelection();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Homepage Deals"
        description="Choose which products appear in the homepage's Featured Deals and This Week's Top Deals rails. Top Selling and Most Reviewed are calculated automatically and aren't editable here."
      />
      <HomepageDealsForm selection={selection} />
    </div>
  );
}
