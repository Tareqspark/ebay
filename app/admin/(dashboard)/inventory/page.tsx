import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { InventoryTable } from "@/components/admin/inventory/inventory-table";
import { getInventory } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Inventory" };

interface InventoryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminInventoryPage({ searchParams }: InventoryPageProps) {
  const [{ status }, inventory] = await Promise.all([searchParams, getInventory()]);
  const warehouseCount = new Set(inventory.map((r) => r.warehouse)).size;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inventory"
        description={`${inventory.length.toLocaleString()} SKUs tracked across ${warehouseCount} warehouses`}
      />
      <InventoryTable records={inventory} initialStatus={status} />
    </div>
  );
}
