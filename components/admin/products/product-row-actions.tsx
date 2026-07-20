"use client";

import Link from "next/link";
import { Archive, Copy, ExternalLink, MoreHorizontal, PanelRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminProductRow } from "@/lib/admin/data";

interface ProductRowActionsProps {
  row: AdminProductRow;
  onOpenDetail: () => void;
  onDuplicate: () => void;
  onToggleArchive: () => void;
}

export function ProductRowActions({ row, onOpenDetail, onDuplicate, onToggleArchive }: ProductRowActionsProps) {
  const isArchived = row.meta.status === "archived";

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Row actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onOpenDetail}>
            <PanelRight />
            Open details
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/product/${row.product.slug}`} target="_blank" />}>
            <ExternalLink />
            View in store
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onToggleArchive} variant={isArchived ? "default" : "destructive"}>
            {isArchived ? <RotateCcw /> : <Archive />}
            {isArchived ? "Restore product" : "Archive product"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
