import { Panel } from "@/components/admin/shared/panel";
import { formatMoney } from "@/lib/admin/format";
import type { RankedEntry } from "@/lib/admin/metrics";

export function RankedList({ title, entries }: { title: string; entries: RankedEntry[] }) {
  const max = Math.max(...entries.map((e) => e.value), 1);

  return (
    <Panel title={title}>
      <ol className="flex flex-col gap-3 px-4 py-3">
        {entries.map((entry, i) => (
          <li key={entry.id} className="flex items-center gap-3">
            <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm text-foreground">{entry.name}</span>
                <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">{formatMoney(entry.value)}</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/70"
                  style={{ width: `${Math.max((entry.value / max) * 100, 3)}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{entry.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
