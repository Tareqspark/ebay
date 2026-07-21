import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { ImportHistoryTable } from "@/components/admin/supplier/import-history-table";
import { getImportHistory } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Import History" };

export default async function AdminSupplierHistoryPage() {
  const importHistory = await getImportHistory();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Supplier" description={`${importHistory.length} completed jobs in the last 30 days`} />
      <SupplierTabs />
      <ImportHistoryTable jobs={importHistory} />
    </div>
  );
}
