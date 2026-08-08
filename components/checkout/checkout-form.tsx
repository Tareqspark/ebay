"use client";

import { useEffect, useState, useTransition } from "react";
import { COUNTRIES, getCountry } from "@/lib/countries";
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
  shippingRateId,
  ratesAvailable,
  onAddressChange,
}: {
  defaultAddress: ShippingAddressInput;
  promoCode?: string | null;
  shippingRateId?: string | null;
  ratesAvailable: boolean;
  onAddressChange: (address: ShippingAddressInput) => void;
}) {
  const [address, setAddress] = useState(defaultAddress);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Country matters as much as state: it decides the shipping zone, so a
  // change to either has to re-quote rates.
  useEffect(() => {
    onAddressChange(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.state, address.country]);

  const country = getCountry(address.country);

  function field(key: keyof ShippingAddressInput) {
    return {
      value: address[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddress((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  function handleContinue() {
    setError(null);
    startTransition(async () => {
      // Guarded because useTransition only clears isPending once the async
      // body settles: an unhandled throw here left the button stuck on
      // "Preparing payment..." and permanently disabled, with nothing shown
      // to explain why. Same failure the cart mutations had.
      try {
        const result = await createPaymentIntentAction(address, promoCode ?? undefined, shippingRateId ?? undefined);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.clientSecret) setClientSecret(result.clientSecret);
        else setError("Couldn't start payment — please try again.");
      } catch {
        setError("Couldn't start payment — please try again.");
      }
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
          <Label htmlFor="co-state">{country.stateLabel}</Label>
          <Input id="co-state" required {...field("state")} />
        </div>
        {country.hasPostalCode && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-zip">{country.postalLabel}</Label>
            <Input id="co-zip" required {...field("zip")} />
          </div>
        )}
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="co-country">Country</Label>
          <select
            id="co-country"
            value={address.country}
            onChange={(e) => {
              // Clear region and postcode: values entered under the previous
              // country's format are meaningless under the new one, and a
              // stale ZIP would quote the wrong zone.
              const next = e.target.value;
              setAddress((prev) => ({ ...prev, country: next, state: "", zip: "" }));
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {address.country !== "US" && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Shipping to {country.name}. US sales tax isn&apos;t charged on international orders, but your country may
          apply import duty or VAT on delivery — those are collected by the carrier, not by Cartebay.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        size="lg"
        disabled={
          isPending ||
          !address.name ||
          !address.line1 ||
          !address.city ||
          !address.state ||
          (country.hasPostalCode && !address.zip) ||
          (ratesAvailable && !shippingRateId)
        }
        onClick={handleContinue}
      >
        {isPending ? "Preparing payment..." : "Continue to Payment"}
      </Button>
    </div>
  );
}
