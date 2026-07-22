import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CustomersTable } from "@/components/admin/customers/customers-table";
import { getCustomers } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Customers" description={`${customers.length.toLocaleString()} customers`} />
      <CustomersTable initialCustomers={customers} />
    </div>
  );
}
