import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { CjTabs } from "@/components/admin/cj/cj-tabs";
import { CjSourcingRequests } from "@/components/admin/cj/cj-sourcing-requests";
import { getCjSourcingRequests } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Sourcing Requests" };

export default async function AdminCjSourcingPage() {
  const requests = await getCjSourcingRequests();
  const submitted = requests.filter((r) => r.status === "submitted").length;
  const sourcing = requests.filter((r) => r.status === "sourcing").length;
  const found = requests.filter((r) => r.status === "found").length;
  const notFound = requests.filter((r) => r.status === "not_found").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="CJdropshipping" description="Ask CJ to source products that aren't in their catalog yet" />
      <CjTabs />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Submitted" value={String(submitted)} />
        <KpiCard label="Sourcing" value={String(sourcing)} />
        <KpiCard label="Found" value={String(found)} />
        <KpiCard label="Not found" value={String(notFound)} alert={notFound > 0} />
      </div>
      <CjSourcingRequests initialRequests={requests} />
    </div>
  );
}
