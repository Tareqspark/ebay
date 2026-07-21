"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { submitReviewAction, type ReviewActionState } from "@/lib/review-actions";

const initialState: ReviewActionState = {};

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [rating, setRating] = useState(5);
  const [state, formAction, isPending] = useActionState(submitReviewAction, initialState);

  if (state.success) {
    return <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground">Thanks — your review is posted.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex flex-col gap-1.5">
        <Label>Your rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`}>
              <Star className={cn("h-5 w-5", value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-title">Title</Label>
        <Input id="review-title" name="title" required maxLength={191} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-body">Review</Label>
        <Textarea id="review-body" name="body" required maxLength={2000} rows={4} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Posting..." : "Post Review"}
      </Button>
    </form>
  );
}
