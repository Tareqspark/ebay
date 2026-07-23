"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";

export interface ReviewActionResult {
  error?: string;
}

export async function setReviewStatusAction(
  reviewId: string,
  status: "approved" | "rejected"
): Promise<ReviewActionResult> {
  const guard = await requirePermission("reviews");
  if (guard) return guard;

  const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
  if (!review) return { error: "Review not found" };

  await db.update(reviews).set({ status }).where(eq(reviews.id, reviewId));

  const actor = await getAdminActorName();
  await logActivity("product", `Review "${review.title}" ${status}`, actor);
  revalidatePath("/admin/reviews");
  return {};
}
