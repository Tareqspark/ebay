import Link from "next/link";
import { Star } from "lucide-react";
import { auth } from "@/auth";
import { getReviewsForProduct, hasUserReviewedProduct } from "@/lib/reviews-data";
import { ReviewForm } from "@/components/product/review-form";
import { cn } from "@/lib/utils";

export async function ReviewsSection({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [session, reviews] = await Promise.all([auth(), getReviewsForProduct(productId)]);
  const alreadyReviewed = session?.user?.id ? await hasUserReviewedProduct(session.user.id, productId) : false;

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="text-lg font-semibold text-foreground">Customer Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>

      {session?.user && !alreadyReviewed && <ReviewForm productId={productId} productSlug={productSlug} />}
      {!session?.user && (
        <p className="text-sm text-muted-foreground">
          <Link href={`/account/sign-in?next=/product/${productSlug}`} className="font-medium text-foreground hover:underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your experience.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {reviews.map((review) => (
            <div key={review.id} className="py-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={cn("h-3.5 w-3.5", value <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-sm font-medium text-foreground">{review.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{review.body}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {review.reviewerName} · {new Date(review.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
