import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { FailedImportsTable } from "@/components/admin/supplier/failed-imports-table";
import { IMPORT_ERRORS } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Failed Imports" };

export default function AdminSupplierFailedPage() {
  const unresolved = IMPORT_ERRORS.filter((e) => !e.resolved).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Supplier" description={`${unresolved} unresolved import errors`} />
      <SupplierTabs />
      <FailedImportsTable initialErrors={IMPORT_ERRORS} />
    </div>
  );
}
