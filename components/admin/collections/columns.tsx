"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate } from "@/lib/admin/format";
import type { Collection } from "@/lib/admin/collections";

interface CollectionColumnActions {
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

function summarizeRule(collection: Collection): string {
  if (collection.type === "manual") return "Manually curated";
  const { rule } = collection;
  const parts: string[] = [];
  if (rule.topCategorySlug) parts.push(rule.topCategorySlug.replace(/-/g, " "));
  if (rule.minPrice != null && rule.maxPrice != null) parts.push(`$${rule.minPrice}–$${rule.maxPrice}`);
  else if (rule.minPrice != null) parts.push(`$${rule.minPrice}+`);
  else if (rule.maxPrice != null) parts.push(`under $${rule.maxPrice}`);
  if (rule.minRating != null) parts.push(`${rule.minRating}+ stars`);
  if (rule.bundledOnly) parts.push("Bundle deals");
  return parts.length > 0 ? parts.join(" · ") : "No conditions set";
}

export function getCollectionColumns(actions: CollectionColumnActions): ColumnDef<Collection, unknown>[] {
  return [
  {
    id: "name",
    header: "Collection",
    size: 260,
    accessorFn: (row) => row.name,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <Image src={`https://picsum.photos/seed/${row.original.imageSeed}/80/80`} alt="" fill sizes="36px" className="object-cover" />
        </div>
        <span className="font-medium text-foreground">{row.original.name}</span>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    size: 110,
    accessorFn: (row) => row.type,
    cell: ({ row }) => (
      <span className="capitalize text-muted-foreground">{row.original.type}</span>
    ),
  },
  {
    id: "rule",
    header: "Rule",
    size: 260,
    enableSorting: false,
    accessorFn: (row) => summarizeRule(row),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{summarizeRule(row.original)}</span>
    ),
  },
  {
    id: "count",
    header: "Products",
    size: 100,
    accessorFn: (row) => row.productCount,
    cell: ({ row }) => <span className="tabular-nums text-foreground">{row.original.productCount.toLocaleString()}</span>,
  },
  {
    id: "status",
    header: "Status",
    size: 100,
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "updated",
    header: "Last updated",
    size: 120,
    accessorFn: (row) => row.updatedAt,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span>,
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
