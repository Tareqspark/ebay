import { Truck } from "lucide-react";

export function CustomerCell({ name, email }: { name: string; email: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground">{name}</p>
      <p className="truncate text-xs text-muted-foreground">{email}</p>
    </div>
  );
}

export function TrackingCell({ tracking, carrier }: { tracking?: string; carrier?: string }) {
  if (!tracking) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Truck className="h-3.5 w-3.5" />
      <span>
        {carrier} {tracking}
      </span>
    </div>
  );
}

export function CjSourceCell({ hasCj, hasSelf }: { hasCj: boolean; hasSelf: boolean }) {
  if (!hasCj) return <span className="text-muted-foreground">Self</span>;
  return <span className="text-muted-foreground">{hasSelf ? "Mixed" : "CJ"}</span>;
}
