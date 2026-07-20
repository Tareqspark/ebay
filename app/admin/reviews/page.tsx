import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { ReviewsTable } from "@/components/admin/reviews/reviews-table";
import { REVIEWS } from "@/lib/admin/reviews";

export const metadata: Metadata = { title: "Reviews" };

export default function AdminReviewsPage() {
  const pending = REVIEWS.filter((r) => r.status === "pending").length;
  const approved = REVIEWS.filter((r) => r.status === "approved").length;
  const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Reviews" description="Moderate customer product reviews" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Pending" value={String(pending)} alert={pending > 0} />
        <KpiCard label="Approved" value={String(approved)} />
        <KpiCard label="Average rating" value={avgRating.toFixed(1)} />
        <KpiCard label="Total reviews" value={String(REVIEWS.length)} />
      </div>
      <ReviewsTable initialReviews={REVIEWS} />
    </div>
  );
}
