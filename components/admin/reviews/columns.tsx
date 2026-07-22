"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatDate } from "@/lib/admin/format";
import type { ProductReview } from "@/lib/admin/reviews";
import { cn } from "@/lib/utils";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i < rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

interface ReviewColumnActions {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function getReviewColumns({ onApprove, onReject }: ReviewColumnActions): ColumnDef<ProductReview, unknown>[] {
  return [
    {
      id: "product",
      header: "Product",
      size: 240,
      accessorFn: (row) => row.productTitle,
      cell: ({ row }) => <span className="truncate font-medium text-foreground">{row.original.productTitle}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      size: 150,
      accessorFn: (row) => row.customerName,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.customerName}</span>,
    },
    {
      id: "rating",
      header: "Rating",
      size: 110,
      accessorFn: (row) => row.rating,
      cell: ({ row }) => <RatingStars rating={row.original.rating} />,
    },
    {
      id: "review",
      header: "Review",
      size: 320,
      enableSorting: false,
      accessorFn: (row) => row.title,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{row.original.title}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.body}</p>
        </div>
      ),
    },
    {
      id: "date",
      header: "Date",
      size: 110,
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "status",
      header: "Status",
      size: 100,
      accessorFn: (row) => row.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      size: 90,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) =>
        row.original.status === "pending" && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="icon-sm" aria-label="Approve" onClick={() => onApprove(row.original.id)}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Reject" onClick={() => onReject(row.original.id)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
    },
  ];
}
