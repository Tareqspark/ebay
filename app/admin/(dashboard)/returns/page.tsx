import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ReturnsTable } from "@/components/admin/returns/returns-table";
import { getReturns } from "@/lib/admin/returns";

export const metadata: Metadata = { title: "Returns" };

export default async function AdminReturnsPage() {
  const returns = await getReturns();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Returns"
        description="Customer-requested returns for self-stocked items. CJ-sourced items are handled under CJdropshipping → After-Sales."
      />
      <ReturnsTable initialReturns={returns} />
    </div>
  );
}
