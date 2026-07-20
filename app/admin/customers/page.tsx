import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CustomersTable } from "@/components/admin/customers/customers-table";
import { CUSTOMERS } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Customers" description={`${CUSTOMERS.length.toLocaleString()} customers`} />
      <CustomersTable initialCustomers={CUSTOMERS} />
    </div>
  );
}
