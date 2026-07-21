import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CjTabs } from "@/components/admin/cj/cj-tabs";
import { DisputesTable } from "@/components/admin/cj/disputes-table";
import { CJ_DISPUTES } from "@/lib/admin/data";

export const metadata: Metadata = { title: "After-Sales" };

export default function AdminCjAfterSalesPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="CJdropshipping"
        description="Lost, damaged, wrong-item, and defective claims filed with CJdropshipping"
      />
      <CjTabs />
      <DisputesTable initialDisputes={CJ_DISPUTES} />
    </div>
  );
}
