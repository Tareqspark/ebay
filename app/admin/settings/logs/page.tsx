import type { Metadata } from "next";
import { getActivity } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AdminAuditLogsPage() {
  const activity = await getActivity();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{activity.length} events in the last 7 days</p>
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto rounded-lg border border-border bg-card">
        <div className="flex flex-col divide-y divide-border/60 font-mono text-xs">
          {activity.map((event) => (
            <div key={event.id} className="flex items-start gap-3 px-4 py-2">
              <span className="shrink-0 text-muted-foreground/70">{formatDateTime(event.createdAt)}</span>
              <span className="shrink-0 text-muted-foreground">{event.actor}</span>
              <span className="text-foreground">{event.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
