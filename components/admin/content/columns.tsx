"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Image as ImageIcon, PanelTop } from "lucide-react";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate } from "@/lib/admin/format";
import type { ContentItem } from "@/lib/admin/content";

const TYPE_ICON = { page: FileText, banner: ImageIcon, hero_slide: PanelTop };
const TYPE_LABEL = { page: "Page", banner: "Banner", hero_slide: "Hero slide" };

export const contentColumns: ColumnDef<ContentItem, unknown>[] = [
  {
    id: "title",
    header: "Content",
    size: 280,
    accessorFn: (row) => row.title,
    cell: ({ row }) => {
      const Icon = TYPE_ICON[row.original.type];
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-foreground">{row.original.title}</span>
        </div>
      );
    },
  },
  {
    id: "type",
    header: "Type",
    size: 120,
    accessorFn: (row) => row.type,
    cell: ({ row }) => <span className="text-muted-foreground">{TYPE_LABEL[row.original.type]}</span>,
  },
  {
    id: "location",
    header: "Location",
    size: 180,
    accessorFn: (row) => row.location,
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.location}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 100,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status === "published" ? "active" : "draft"} />,
  },
  {
    id: "updated",
    header: "Last updated",
    size: 120,
    accessorFn: (row) => row.updatedAt,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span>,
  },
];
