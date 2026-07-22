"use client";

import { useState, useTransition } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createPaymentIntentAction, type ShippingAddressInput } from "@/lib/checkout-actions";
import { StripePaymentStep } from "@/components/checkout/stripe-payment-step";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}

export function CheckoutForm({
  defaultAddress,
  promoCode,
}: {
  defaultAddress: ShippingAddressInput;
  promoCode?: string | null;
}) {
  const [address, setAddress] = useState(defaultAddress);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function field(key: keyof ShippingAddressInput) {
    return {
      value: address[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddress((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  function handleContinue() {
    setError(null);
    startTransition(async () => {
      const result = await createPaymentIntentAction(address, promoCode ?? undefined);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.clientSecret) setClientSecret(result.clientSecret);
    });
  }

  if (clientSecret) {
    const promise = getStripePromise();
    if (!promise) {
      return <p className="text-sm text-destructive">Stripe publishable key is missing from .env.local.</p>;
    }
    return (
      <Elements stripe={promise} options={{ clientSecret }}>
        <StripePaymentStep />
      </Elements>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Shipping Address</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="co-name">Full name</Label>
          <Input id="co-name" required {...field("name")} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="co-line1">Address</Label>
          <Input id="co-line1" required {...field("line1")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-city">City</Label>
          <Input id="co-city" required {...field("city")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-state">State</Label>
          <Input id="co-state" required {...field("state")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="co-zip">ZIP</Label>
          <Input id="co-zip" required {...field("zip")} />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        size="lg"
        disabled={isPending || !address.name || !address.line1 || !address.city || !address.state || !address.zip}
        onClick={handleContinue}
      >
        {isPending ? "Preparing payment..." : "Continue to Payment"}
      </Button>
    </div>
  );
}
