import { CreditCard, Package, RefreshCw, Server, ShoppingCart, Users } from "lucide-react";
import { Panel } from "@/components/admin/shared/panel";
import { ACTIVITY } from "@/lib/admin/data";
import { formatRelative } from "@/lib/admin/format";
import type { ActivityType } from "@/lib/admin/types";

const ICON: Record<ActivityType, typeof ShoppingCart> = {
  order: ShoppingCart,
  payment: CreditCard,
  import: RefreshCw,
  product: Package,
  customer: Users,
  system: Server,
};

export function ActivityFeedPanel() {
  const recent = ACTIVITY.slice(0, 8);

  return (
    <Panel title="Recent activity">
      <ul className="flex flex-col gap-0.5 px-2 py-2">
        {recent.map((event) => {
          const Icon = ICON[event.type];
          return (
            <li key={event.id} className="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground">{event.message}</p>
                <p className="text-xs text-muted-foreground">
                  {event.actor} · {formatRelative(event.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
