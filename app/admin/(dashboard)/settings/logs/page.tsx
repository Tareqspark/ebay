import type { Metadata } from "next";
import { FieldChanges } from "@/components/admin/shared/field-changes";
import { getActivity } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AdminAuditLogsPage() {
  const activity = await getActivity();
  const edits = activity.filter((e) => e.changes !== null).length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {activity.length} events
        {edits > 0 && <> · {edits} recorded a before and after</>}
      </p>
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto rounded-lg border border-border bg-card">
        <div className="flex flex-col divide-y divide-border/60 text-xs">
          {activity.map((event) => (
            <div key={event.id} className="flex flex-col gap-1.5 px-4 py-2">
              <div className="flex flex-wrap items-start gap-x-3 gap-y-0.5 font-mono">
                <span className="shrink-0 text-muted-foreground/70">{formatDateTime(event.createdAt)}</span>
                <span className="shrink-0 text-muted-foreground">{event.actor}</span>
                <span className="text-foreground">{event.message}</span>
              </div>
              {/* The values themselves, not just which fields moved. */}
              {event.changes && <FieldChanges changes={event.changes} className="pl-1 sm:pl-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
