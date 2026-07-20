import { Panel } from "@/components/admin/shared/panel";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { IMPORT_QUEUE, getSupplier } from "@/lib/admin/data";

export function ImportQueuePanel() {
  return (
    <Panel title="Import queue" description={`${IMPORT_QUEUE.length} active jobs`} viewAllHref="/admin/supplier/queue">
      <ul className="flex flex-col gap-3 px-4 py-3">
        {IMPORT_QUEUE.map((job) => {
          const supplier = getSupplier(job.supplierId);
          const pct = job.status === "running" ? Math.round((job.processedItems / job.totalItems) * 100) : 0;
          return (
            <li key={job.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{supplier?.name ?? job.supplierId}</span>
                <StatusBadge status={job.status} />
              </div>
              <div className="flex items-center gap-2">
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {job.processedItems.toLocaleString()} / {job.totalItems.toLocaleString()} items · {job.type.replace(/_/g, " ")}
              </p>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
