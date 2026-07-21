import "server-only";
import { eq, and, desc, avg, count } from "drizzle-orm";
import { db } from "@/db";
import { reviews, users } from "@/db/schema";

export interface ProductReviewRow {
  id: string;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  createdAt: string;
}

export async function getReviewsForProduct(productId: string): Promise<ProductReviewRow[]> {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      createdAt: reviews.createdAt,
      reviewerName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));

  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

export async function getReviewSummary(productId: string): Promise<{ rating: number; count: number } | null> {
  const [row] = await db
    .select({ avgRating: avg(reviews.rating), total: count(reviews.id) })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")));

  if (!row || Number(row.total) === 0) return null;
  return { rating: Math.round(Number(row.avgRating) * 10) / 10, count: Number(row.total) };
}

export async function hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
    .limit(1);
  return Boolean(existing);
}
