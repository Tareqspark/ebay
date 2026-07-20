import { CheckCircle2, Circle } from "lucide-react";
import type { Carrier } from "@/lib/admin/shipping";

export function CarrierCard({ carrier }: { carrier: Carrier }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-foreground">{carrier.name}</p>
        {carrier.connected ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Circle className="h-3.5 w-3.5" />
            Not connected
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {carrier.servicesUsed.length > 0 ? carrier.servicesUsed.join(", ") : "No services configured"}
      </p>
    </div>
  );
}
