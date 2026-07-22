"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { newId } from "@/lib/id";
import { auth } from "@/auth";
import { hasUserReviewedProduct } from "@/lib/reviews-data";
import { checkPlainText } from "@/lib/sanitize";

const reviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(1, "Title is required").max(191),
  body: z.string().trim().min(1, "Review text is required").max(2000),
});

export interface ReviewActionState {
  error?: string;
  success?: boolean;
}

export async function submitReviewAction(_prevState: ReviewActionState, formData: FormData): Promise<ReviewActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to leave a review." };
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }
  const textError = checkPlainText(parsed.data.title, "Title") ?? checkPlainText(parsed.data.body, "Review text");
  if (textError) return { error: textError };

  const alreadyReviewed = await hasUserReviewedProduct(session.user.id, parsed.data.productId);
  if (alreadyReviewed) {
    return { error: "You've already reviewed this product." };
  }

  // Approved immediately for now — real moderation would set "pending" and
  // route through the existing admin Reviews screen (lib/admin/reviews.ts).
  await db.insert(reviews).values({
    id: newId(),
    productId: parsed.data.productId,
    userId: session.user.id,
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
    status: "approved",
  });

  revalidatePath(`/product/${parsed.data.productSlug}`);
  return { success: true };
}
