import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { ORDERS } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Orders" };

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const { status, q } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Orders" description={`${ORDERS.length.toLocaleString()} orders`} />
      <OrdersTable initialOrders={ORDERS} initialStatusFilter={status} initialQuery={q} />
    </div>
  );
}
