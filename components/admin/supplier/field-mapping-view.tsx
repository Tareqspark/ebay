"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldMapping, Supplier } from "@/lib/admin/types";

export function FieldMappingView({ suppliers, mappings }: { suppliers: Supplier[]; mappings: FieldMapping[] }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const mapping = mappings.find((m) => m.supplierId === supplierId);
  const supplier = suppliers.find((s) => s.id === supplierId);
  const supplierItems: Record<string, string> = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Supplier</span>
        <Select value={supplierId} onValueChange={(v) => v && setSupplierId(v)} items={supplierItems}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {supplier && <span className="text-xs text-muted-foreground">via {supplier.integration}</span>}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="grid grid-cols-[1fr_auto_1fr_1fr] gap-3 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Source field</span>
          <span></span>
          <span>Baruashop field</span>
          <span>Transform</span>
        </div>
        {mapping?.mappings.map((m) => (
          <div
            key={m.sourceField}
            className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-3 border-b border-border/60 px-4 py-2.5 text-sm last:border-0"
          >
            <span className="font-mono text-xs text-muted-foreground">{m.sourceField}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="font-mono text-xs text-foreground">{m.targetField}</span>
            <span className="text-xs text-muted-foreground">{m.transform ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
