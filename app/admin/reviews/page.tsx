import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { ReviewsTable } from "@/components/admin/reviews/reviews-table";
import { getReviews } from "@/lib/admin/reviews";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  const pending = reviews.filter((r) => r.status === "pending").length;
  const approved = reviews.filter((r) => r.status === "approved").length;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Reviews" description="Moderate customer product reviews" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Pending" value={String(pending)} alert={pending > 0} />
        <KpiCard label="Approved" value={String(approved)} />
        <KpiCard label="Average rating" value={avgRating.toFixed(1)} />
        <KpiCard label="Total reviews" value={String(reviews.length)} />
      </div>
      <ReviewsTable initialReviews={reviews} />
    </div>
  );
}
