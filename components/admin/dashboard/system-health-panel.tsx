import { Panel } from "@/components/admin/shared/panel";
import { getSystemComponents } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

const DOT_CLASS: Record<string, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  outage: "bg-red-500",
};

export async function SystemHealthPanel() {
  const systemComponents = await getSystemComponents();
  const allOperational = systemComponents.every((c) => c.status === "operational");

  return (
    <Panel
      title="System health"
      description={allOperational ? "All systems operational" : "Some systems need attention"}
    >
      <ul className="divide-y divide-border/60">
        {systemComponents.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[c.status])} />
              {c.name}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">{c.latencyMs}ms</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
