"use client";

import { Ban, MoreHorizontal, PackageCheck, PanelRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Order } from "@/lib/admin/types";

interface OrderRowActionsProps {
  order: Order;
  onOpenDetail: () => void;
  onMarkShipped: () => void;
  onCancel: () => void;
  onPushToCj: () => void;
}

export function OrderRowActions({ order, onOpenDetail, onMarkShipped, onCancel, onPushToCj }: OrderRowActionsProps) {
  const hasSelfItems = order.items.some((item) => item.source === "self");
  const hasCjItems = order.items.some((item) => item.source === "cj");
  const canShip = hasSelfItems && (order.fulfillmentStatus === "unfulfilled" || order.fulfillmentStatus === "processing");
  const canPushToCj = hasCjItems && order.cjSyncStatus === "not_sent";
  const canCancel = !["delivered", "cancelled"].includes(order.fulfillmentStatus);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Order actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={onOpenDetail}>
            <PanelRight />
            Open details
          </DropdownMenuItem>
          {canPushToCj && (
            <DropdownMenuItem onClick={onPushToCj}>
              <Send />
              Push to CJ
            </DropdownMenuItem>
          )}
          {canShip && (
            <DropdownMenuItem onClick={onMarkShipped}>
              <PackageCheck />
              Mark as shipped
            </DropdownMenuItem>
          )}
          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onCancel}>
                <Ban />
                Cancel order
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
