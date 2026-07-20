import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SupplierTabs } from "@/components/admin/supplier/supplier-tabs";
import { FieldMappingView } from "@/components/admin/supplier/field-mapping-view";
import { SUPPLIERS, FIELD_MAPPINGS } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Field Mapping" };

export default function AdminSupplierMappingPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Supplier" description="How each supplier's feed maps onto Baruashop product fields" />
      <SupplierTabs />
      <FieldMappingView suppliers={SUPPLIERS} mappings={FIELD_MAPPINGS} />
    </div>
  );
}
