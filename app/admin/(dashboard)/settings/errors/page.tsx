import type { Metadata } from "next";
import { getErrorLogs } from "@/lib/admin/data";
import { ErrorLogsTable } from "@/components/admin/settings/error-logs-table";

export const metadata: Metadata = { title: "Error Logs" };

export default async function AdminErrorLogsPage() {
  const logs = await getErrorLogs();
  return <ErrorLogsTable initialLogs={logs} />;
}
