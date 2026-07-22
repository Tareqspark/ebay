"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";

export interface ReviewActionResult {
  error?: string;
}

export async function setReviewStatusAction(
  reviewId: string,
  status: "approved" | "rejected"
): Promise<ReviewActionResult> {
  const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (!review) return { error: "Review not found" };

  await db.update(reviews).set({ status }).where(eq(reviews.id, reviewId));

  const actor = await getAdminActorName();
  await logActivity("product", `Review "${review.title}" ${status}`, actor);
  revalidatePath("/admin/reviews");
  return {};
}
