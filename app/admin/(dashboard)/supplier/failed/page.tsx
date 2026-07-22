import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { FailedImportsTable } from "@/components/admin/supplier/failed-imports-table";
import { getImportErrors } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Failed Imports" };

export default async function AdminSupplierFailedPage() {
  const importErrors = await getImportErrors();
  const unresolved = importErrors.filter((e) => !e.resolved).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Supplier" description={`${unresolved} unresolved import errors`} />
      <SupplierTabs />
      <FailedImportsTable initialErrors={importErrors} />
    </div>
  );
}
