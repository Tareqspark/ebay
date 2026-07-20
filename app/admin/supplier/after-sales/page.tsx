import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { DisputesTable } from "@/components/admin/cj/disputes-table";
import { CJ_DISPUTES } from "@/lib/admin/data";

export const metadata: Metadata = { title: "After-Sales" };

export default function AdminAfterSalesPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Supplier"
        description="Lost, damaged, wrong-item, and defective claims filed with CJdropshipping"
      />
      <SupplierTabs />
      <DisputesTable initialDisputes={CJ_DISPUTES} />
    </div>
  );
}
