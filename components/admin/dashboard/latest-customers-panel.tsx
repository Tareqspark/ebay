import { Panel } from "@/components/admin/shared/panel";
import { getCustomers } from "@/lib/admin/data";
import { formatMoney, formatRelative } from "@/lib/admin/format";

export async function LatestCustomersPanel() {
  const customers = await getCustomers();
  const latest = [...customers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return (
    <Panel title="Latest customers" viewAllHref="/admin/customers">
      <ul className="divide-y divide-border/60">
        {latest.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">Joined {formatRelative(c.createdAt)}</p>
              </div>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatMoney(c.lifetimeValue)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
