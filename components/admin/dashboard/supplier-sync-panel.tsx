import { Panel } from "@/components/admin/shared/panel";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { getSuppliers } from "@/lib/admin/data";
import { formatRelative } from "@/lib/admin/format";

export async function SupplierSyncPanel() {
  const suppliers = await getSuppliers();
  const sorted = [...suppliers].sort((a, b) => new Date(b.lastSyncAt).getTime() - new Date(a.lastSyncAt).getTime());

  return (
    <Panel title="Supplier sync status" viewAllHref="/admin/supplier">
      <ul className="divide-y divide-border/60">
        {sorted.slice(0, 6).map((s) => (
          <li key={s.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">Synced {formatRelative(s.lastSyncAt)}</p>
            </div>
            <StatusBadge status={s.status} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
