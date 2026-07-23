"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from "lucide-react";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { resolveErrorLogAction } from "@/lib/admin/error-log-actions";
import { formatDateTime } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { AdminErrorLogRow } from "@/lib/admin/data";

const SOURCE_LABEL: Record<AdminErrorLogRow["source"], string> = {
  "server-action": "Server action",
  "route-handler": "Route handler",
  "render-boundary": "Render boundary",
  provider: "Provider",
};

export function ErrorLogsTable({ initialLogs }: { initialLogs: AdminErrorLogRow[] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [status, setStatus] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [source, setSource] = useState<"all" | AdminErrorLogRow["source"]>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const unresolvedCount = logs.filter((l) => !l.resolved).length;
  const last24h = logs.filter((l) => Date.now() - new Date(l.createdAt).getTime() < 24 * 60 * 60 * 1000).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (status === "unresolved" && l.resolved) return false;
      if (status === "resolved" && !l.resolved) return false;
      if (source !== "all" && l.source !== source) return false;
      if (q && !l.label.toLowerCase().includes(q) && !l.message.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, status, source, search]);

  async function toggleResolved(row: AdminErrorLogRow) {
    setPending(row.id);
    const next = !row.resolved;
    const result = await resolveErrorLogAction(row.id, next);
    setPending(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setLogs((prev) => prev.map((l) => (l.id === row.id ? { ...l, resolved: next } : l)));
    toast.success(next ? "Marked resolved" : "Marked unresolved");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <KpiCard label="Unresolved" value={String(unresolvedCount)} alert={unresolvedCount > 0} />
        <KpiCard label="Last 24h" value={String(last24h)} />
        <KpiCard label="Total (last 300)" value={String(logs.length)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search label or message..."
          className="h-9 w-56 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="unresolved">Unresolved</option>
          <option value="resolved">Resolved</option>
          <option value="all">All statuses</option>
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as typeof source)}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All sources</option>
          {Object.entries(SOURCE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-[calc(100vh-360px)] overflow-y-auto rounded-lg border border-border bg-card">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No error logs match these filters.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {filtered.map((row) => {
              const isOpen = expanded === row.id;
              return (
                <div key={row.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : row.id)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-xs hover:bg-muted/40"
                  >
                    {isOpen ? (
                      <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="shrink-0 font-mono text-muted-foreground/70">{formatDateTime(row.createdAt)}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 font-medium",
                        row.resolved
                          ? "bg-muted text-muted-foreground"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                      )}
                    >
                      {row.resolved ? "resolved" : "open"}
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{SOURCE_LABEL[row.source]}</span>
                    <span className="shrink-0 font-mono font-medium text-foreground">{row.label}</span>
                    <span className="truncate font-mono text-muted-foreground">{row.message}</span>
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/20 px-4 py-3 pl-11">
                      {row.url && <p className="text-xs text-muted-foreground">URL: {row.url}</p>}
                      {row.stack && (
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">
                          {row.stack}
                        </pre>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleResolved(row)}
                        disabled={pending === row.id}
                        className="w-fit rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                      >
                        {row.resolved ? "Mark unresolved" : "Mark resolved"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
