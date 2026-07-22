"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Mail, Megaphone, Pencil, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate, formatMoney, formatNumber } from "@/lib/admin/format";
import type { Campaign } from "@/lib/admin/marketing";

const TYPE_ICON = { discount: Tag, email: Mail, banner: Megaphone };

interface CampaignColumnActions {
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

export function getCampaignColumns(actions: CampaignColumnActions): ColumnDef<Campaign, unknown>[] {
  return [
  {
    id: "name",
    header: "Campaign",
    size: 260,
    accessorFn: (row) => row.name,
    cell: ({ row }) => {
      const Icon = TYPE_ICON[row.original.type];
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.original.name}</p>
            {row.original.code && <p className="font-mono text-xs text-muted-foreground">{row.original.code}</p>}
          </div>
        </div>
      );
    },
  },
  {
    id: "channel",
    header: "Channel",
    size: 150,
    accessorFn: (row) => row.channel,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.channel}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 100,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "dates",
    header: "Dates",
    size: 190,
    enableSorting: false,
    accessorFn: (row) => row.startDate,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(row.original.startDate)}
        {row.original.endDate ? ` – ${formatDate(row.original.endDate)}` : " – ongoing"}
      </span>
    ),
  },
  {
    id: "redemptions",
    header: "Redemptions",
    size: 110,
    accessorFn: (row) => row.redemptions,
    cell: ({ row }) => <span className="tabular-nums text-foreground">{formatNumber(row.original.redemptions)}</span>,
  },
  {
    id: "revenue",
    header: "Revenue attributed",
    size: 150,
    accessorFn: (row) => row.revenueAttributed,
    cell: ({ row }) => (
      <span className="tabular-nums font-medium text-foreground">{formatMoney(row.original.revenueAttributed)}</span>
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
