import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatNumber } from "@/lib/admin/format";
import type { AdminImportJobRow } from "@/lib/admin/data";

export function ImportQueueList({ jobs }: { jobs: AdminImportJobRow[] }) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No jobs in the queue right now.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => {
        const pct = job.status === "running" ? Math.round((job.processedItems / job.totalItems) * 100) : 0;
        return (
          <div key={job.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{job.supplierName}</p>
                <p className="text-xs text-muted-foreground capitalize">{job.type.replace(/_/g, " ")} · {job.id}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={pct} className="h-1.5 flex-1" />
              <span className="w-32 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {formatNumber(job.processedItems)} / {formatNumber(job.totalItems)} ({pct}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
