import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { InventoryTable } from "@/components/admin/inventory/inventory-table";
import { INVENTORY } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Inventory" };

interface InventoryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminInventoryPage({ searchParams }: InventoryPageProps) {
  const { status } = await searchParams;
  const warehouseCount = new Set(INVENTORY.map((r) => r.warehouse)).size;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inventory"
        description={`${INVENTORY.length.toLocaleString()} SKUs tracked across ${warehouseCount} warehouses`}
      />
      <InventoryTable records={INVENTORY} initialStatus={status} />
    </div>
  );
}
