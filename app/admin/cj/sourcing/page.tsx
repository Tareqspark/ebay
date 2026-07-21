import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { CjTabs } from "@/components/admin/cj/cj-tabs";
import { CjSourcingRequests } from "@/components/admin/cj/cj-sourcing-requests";
import { CJ_SOURCING_REQUESTS } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Sourcing Requests" };

export default function AdminCjSourcingPage() {
  const submitted = CJ_SOURCING_REQUESTS.filter((r) => r.status === "submitted").length;
  const sourcing = CJ_SOURCING_REQUESTS.filter((r) => r.status === "sourcing").length;
  const found = CJ_SOURCING_REQUESTS.filter((r) => r.status === "found").length;
  const notFound = CJ_SOURCING_REQUESTS.filter((r) => r.status === "not_found").length;

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
      <CjSourcingRequests initialRequests={CJ_SOURCING_REQUESTS} />
    </div>
  );
}
