import { cache } from "react";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { reviews as reviewsTable } from "@/db/schema";
import { getProducts, getCustomers } from "@/lib/admin/data";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ProductReview {
  id: string;
  productId: string;
  productTitle: string;
  customerId: string;
  customerName: string;
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
 * real usage. productTitle/customerName are denormalized here rather than
 * resolved per-row, since the moderation table's column cells run inside a
 * "use client" component and can't do their own async DB lookups.
 */
export const getReviews = cache(async (): Promise<ProductReview[]> => {
  const [rows, products, customers] = await Promise.all([
    db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt)),
    getProducts(),
    getCustomers(),
  ]);
  const productById = new Map(products.map((p) => [p.id, p]));
  const customerById = new Map(customers.map((c) => [c.id, c]));
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    productTitle: productById.get(r.productId)?.title ?? r.productId,
    customerId: r.userId,
    customerName: customerById.get(r.userId)?.name ?? r.userId,
    rating: r.rating as ProductReview["rating"],
    title: r.title,
    body: r.body,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
});
