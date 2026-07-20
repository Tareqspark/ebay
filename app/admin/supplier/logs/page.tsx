import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { LogViewer } from "@/components/admin/supplier/log-viewer";
import { SUPPLIER_LOGS, SUPPLIERS } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Supplier Logs" };

export default function AdminSupplierLogsPage() {
  const supplierOptions = SUPPLIERS.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Supplier" description="Raw sync activity across all connected suppliers" />
      <SupplierTabs />
      <LogViewer logs={SUPPLIER_LOGS} supplierOptions={supplierOptions} />
    </div>
  );
}
