import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { getOrders } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Orders" };

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const [{ status, q }, orders] = await Promise.all([searchParams, getOrders()]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Orders" description={`${orders.length.toLocaleString()} orders`} />
      <OrdersTable initialOrders={orders} initialStatusFilter={status} initialQuery={q} />
    </div>
  );
}
