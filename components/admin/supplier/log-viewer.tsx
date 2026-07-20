"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { getSupplier } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { SupplierLog } from "@/lib/admin/types";

const LEVEL_CLASS: Record<string, string> = {
  info: "text-muted-foreground",
  warn: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

export function LogViewer({ logs, supplierOptions }: { logs: SupplierLog[]; supplierOptions: { value: string; label: string }[] }) {
  const [level, setLevel] = useState("all");
  const [supplierId, setSupplierId] = useState("all");

  const filtered = useMemo(
    () =>
      logs.filter((l) => {
        if (level !== "all" && l.level !== level) return false;
        if (supplierId !== "all" && l.supplierId !== supplierId) return false;
        return true;
      }),
    [logs, level, supplierId]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={level}
          onChange={setLevel}
          allLabel="All levels"
          width="w-[130px]"
          options={[
            { value: "info", label: "Info" },
            { value: "warn", label: "Warning" },
            { value: "error", label: "Error" },
          ]}
        />
        <FilterSelect value={supplierId} onChange={setSupplierId} allLabel="All suppliers" width="w-[200px]" options={supplierOptions} />
        <span className="text-xs text-muted-foreground">{filtered.length.toLocaleString()} entries</span>
      </div>
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto rounded-lg border border-border bg-card">
        <div className="flex flex-col divide-y divide-border/60 font-mono text-xs">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-4 py-2">
              <span className="shrink-0 text-muted-foreground/70">{formatDateTime(log.timestamp)}</span>
              <span className={cn("shrink-0 font-semibold uppercase", LEVEL_CLASS[log.level])}>{log.level}</span>
              <span className="shrink-0 text-muted-foreground">{getSupplier(log.supplierId)?.name ?? log.supplierId}</span>
              <span className="text-foreground">{log.message}</span>
            </div>
          ))}
          {filtered.length === 0 && <p className="px-4 py-8 text-center text-muted-foreground">No log entries match these filters.</p>}
        </div>
      </div>
    </div>
  );
}
