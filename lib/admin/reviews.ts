import { cache } from "react";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { reviews as reviewsTable } from "@/db/schema";
import { getProduct, getCustomer } from "@/lib/admin/data";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  status: ReviewStatus;
  createdAt: string;
}

/**
 * Real customer reviews (db/schema.ts's `reviews` table — the same one
 * customers write to from the storefront's product pages, see
 * lib/reviews-data.ts). This replaces a 90-row seeded-random generator;
 * the moderation queue now only shows reviews real customers actually
 * submitted, which will be a much shorter list until the storefront has
 * real usage.
 */
export const getReviews = cache(async (): Promise<ProductReview[]> => {
  const rows = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    customerId: r.userId,
    rating: r.rating as ProductReview["rating"],
    title: r.title,
    body: r.body,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
});

export async function getReviewProductTitle(review: ProductReview): Promise<string> {
  const product = await getProduct(review.productId);
  return product?.title ?? review.productId;
}
export async function getReviewCustomerName(review: ProductReview): Promise<string> {
  const customer = await getCustomer(review.customerId);
  return customer?.name ?? review.customerId;
}
