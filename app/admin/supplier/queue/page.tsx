import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { ImportQueueList } from "@/components/admin/supplier/import-queue-list";
import { IMPORT_QUEUE } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Import Queue" };

export default function AdminSupplierQueuePage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Supplier" description={`${IMPORT_QUEUE.length} jobs in progress`} />
      <SupplierTabs />
      <ImportQueueList jobs={IMPORT_QUEUE} />
    </div>
  );
}
