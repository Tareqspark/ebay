"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

export function StripePaymentStep() {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (submitError) {
      setError(submitError.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
    }
    // On success, Stripe redirects to return_url — no further action needed here.
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Payment</h2>
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button size="lg" disabled={!stripe || isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? "Processing..." : "Place Order"}
      </Button>
    </div>
  );
}
