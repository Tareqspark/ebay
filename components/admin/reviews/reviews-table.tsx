"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
import { FilterSelect } from "@/components/admin/table/filter-select";
import { getReviewColumns } from "@/components/admin/reviews/columns";
import { setReviewStatusAction } from "@/lib/admin/review-actions";
import type { ProductReview } from "@/lib/admin/reviews";

export function ReviewsTable({ initialReviews }: { initialReviews: ProductReview[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => reviews.filter((r) => status === "all" || r.status === status), [reviews, status]);

  async function setStatusFor(id: string, next: "approved" | "rejected") {
    const result = await setReviewStatusAction(id, next);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    toast.success(next === "approved" ? "Review approved" : "Review rejected");
  }

  const columns = useMemo(
    () =>
      getReviewColumns({
        onApprove: (id) => setStatusFor(id, "approved"),
        onReject: (id) => setStatusFor(id, "rejected"),
      }),
    []
  );

  return (
    <DataTable
      columns={columns}
      data={filtered}
      getRowId={(r) => r.id}
      emptyMessage="No reviews match these filters."
      toolbar={(table) => (
        <>
          <TableSearch table={table} placeholder="Search reviews..." />
          <FilterSelect
            value={status}
            onChange={setStatus}
            allLabel="All statuses"
            options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        </>
      )}
    />
  );
}
