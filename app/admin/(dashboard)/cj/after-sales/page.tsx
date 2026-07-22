import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CjTabs } from "@/components/admin/cj/cj-tabs";
import { DisputesTable } from "@/components/admin/cj/disputes-table";
import { getCjDisputes } from "@/lib/admin/data";

export const metadata: Metadata = { title: "After-Sales" };

export default async function AdminCjAfterSalesPage() {
  const disputes = await getCjDisputes();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="CJdropshipping"
        description="Lost, damaged, wrong-item, and defective claims filed with CJdropshipping"
      />
      <CjTabs />
      <DisputesTable initialDisputes={disputes} />
    </div>
  );
}
