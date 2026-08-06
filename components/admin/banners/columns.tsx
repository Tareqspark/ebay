"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate } from "@/lib/admin/format";
import { PLACEMENT_LABELS, LINK_TYPE_LABELS, type AdminBanner } from "@/lib/admin/banner-constants";

interface BannerColumnActions {
  onEdit: (banner: AdminBanner) => void;
  onDelete: (banner: AdminBanner) => void;
}

function describeSchedule(banner: AdminBanner): string {
  if (!banner.startsAt && !banner.endsAt) return "Always";
  const from = banner.startsAt ? formatDate(banner.startsAt) : "Now";
  const to = banner.endsAt ? formatDate(banner.endsAt) : "No end";
  return `${from} → ${to}`;
}

export function getBannerColumns(actions: BannerColumnActions): ColumnDef<AdminBanner, unknown>[] {
  return [
    {
      id: "name",
      header: "Banner",
      size: 260,
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            <Image src={row.original.imageUrl} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <span className="font-medium text-foreground">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "placement",
      header: "Placement",
      size: 220,
      accessorFn: (row) => PLACEMENT_LABELS[row.placement],
      cell: ({ row }) => <span className="text-muted-foreground">{PLACEMENT_LABELS[row.original.placement]}</span>,
    },
    {
      id: "link",
      header: "Links to",
      size: 200,
      enableSorting: false,
      accessorFn: (row) => row.linkValue || LINK_TYPE_LABELS[row.linkType],
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.linkType === "none" ? "—" : `${LINK_TYPE_LABELS[row.original.linkType]}: ${row.original.linkValue}`}
        </span>
      ),
    },
    {
      id: "schedule",
      header: "Schedule",
      size: 160,
      accessorFn: (row) => row.startsAt ?? "",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{describeSchedule(row.original)}</span>,
    },
    {
      id: "status",
      header: "Status",
      size: 140,
      accessorFn: (row) => row.status,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={row.original.status} />
          {/* An active banner outside its date window isn't showing — say so, rather than let "Active" imply it is. */}
          {row.original.status === "active" && !row.original.isLiveNow && (
            <span className="text-[10px] text-muted-foreground">scheduled</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 80,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="icon-sm" aria-label="Edit" onClick={() => actions.onEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Delete" onClick={() => actions.onDelete(row.original)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
