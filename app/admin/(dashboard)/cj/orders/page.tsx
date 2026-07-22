import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CjTabs } from "@/components/admin/cj/cj-tabs";
import { CjOrdersTable } from "@/components/admin/cj/cj-orders-table";
import { getOrders } from "@/lib/admin/data";

export const metadata: Metadata = { title: "CJ Orders" };

export default async function AdminCjOrdersPage() {
  const orders = await getOrders();
  const cjOrders = orders.filter((o) => o.items.some((i) => i.source === "cj"));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="CJdropshipping" description={`${cjOrders.length.toLocaleString()} orders with CJ-sourced items`} />
      <CjTabs />
      <CjOrdersTable initialOrders={cjOrders} />
    </div>
  );
}
