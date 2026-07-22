"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Percent, DollarSign, Truck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate, formatMoney, formatNumber } from "@/lib/admin/format";
import type { PromoCode } from "@/lib/admin/promos";

const TYPE_ICON = { percent: Percent, fixed: DollarSign, free_shipping: Truck };

function discountLabel(promo: PromoCode): string {
  if (promo.discountType === "percent") return `${promo.discountPercent}% off`;
  if (promo.discountType === "fixed") return `${formatMoney(promo.discountAmount ?? 0)} off`;
  return "Free delivery";
}

interface PromoCodeColumnActions {
  onEdit: (promo: PromoCode) => void;
  onDelete: (promo: PromoCode) => void;
}

export function getPromoCodeColumns(actions: PromoCodeColumnActions): ColumnDef<PromoCode, unknown>[] {
  return [
    {
      id: "code",
      header: "Code",
      size: 220,
      accessorFn: (row) => row.code,
      cell: ({ row }) => {
        const Icon = TYPE_ICON[row.original.discountType];
        return (
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-xs font-medium text-foreground">{row.original.code}</p>
              <p className="text-xs text-muted-foreground">{discountLabel(row.original)}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "usageLimit",
      header: "Usage limit",
      size: 130,
      enableSorting: false,
      accessorFn: (row) => row.usageLimit ?? Infinity,
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.usageLimit != null ? `${formatNumber(row.original.usageCount)} / ${formatNumber(row.original.usageLimit)}` : "Unlimited"}
        </span>
      ),
    },
    {
      id: "minOrderAmount",
      header: "Min. order",
      size: 110,
      accessorFn: (row) => row.minOrderAmount ?? 0,
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.minOrderAmount ? formatMoney(row.original.minOrderAmount) : "None"}
        </span>
      ),
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
      header: "Active window",
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
      id: "usageCount",
      header: "Redemptions",
      size: 110,
      accessorFn: (row) => row.usageCount,
      cell: ({ row }) => <span className="tabular-nums text-foreground">{formatNumber(row.original.usageCount)}</span>,
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
