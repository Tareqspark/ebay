"use client";

import { useEffect, useState, useTransition } from "react";
import { Award, Tag, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { applyPromoCodeAction } from "@/lib/promo-actions";
import { getShippingRatesAction, previewShippingTotalsAction } from "@/lib/shipping-rates-actions";
import { formatPrice } from "@/lib/format";
import type { ShippingAddressInput } from "@/lib/checkout-actions";
import type { CartSummary } from "@/lib/cart";
import type { AvailableShippingRate } from "@/lib/shipping-rates";

interface AppliedPromo {
  code: string;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

interface LoyaltyDiscount {
  tierName: string;
  discountPercent: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

interface CheckoutClientProps {
  cart: CartSummary;
  defaultAddress: ShippingAddressInput;
  baseTotals: { shipping: number; tax: number; total: number };
  loyaltyDiscount: LoyaltyDiscount | null;
}

export function CheckoutClient({ cart, defaultAddress, baseTotals, loyaltyDiscount }: CheckoutClientProps) {
  const [promoInput, setPromoInput] = useState("");
  const [applied, setApplied] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplying, startApplying] = useTransition();

  const [addressState, setAddressState] = useState(defaultAddress.state);
  const [addressCountry, setAddressCountry] = useState(defaultAddress.country || "US");
  const [addressZip, setAddressZip] = useState(defaultAddress.zip);
  /**
   * Debounced, and only once the postcode looks finished.
   *
   * A live USPS quote is a real API call against a 60-per-hour budget, and a
   * ZIP is typed one character at a time — quoting on every keystroke would
   * spend five calls to price one address, each on a different partial code
   * that caches separately. Five digits domestically, anything non-empty
   * abroad where formats vary.
   */
  const [quoteZip, setQuoteZip] = useState("");
  useEffect(() => {
    const trimmed = addressZip.trim();
    const usable = addressCountry.trim().toUpperCase() === "US" ? /^\d{5}(-\d{4})?$/.test(trimmed) : trimmed.length > 0;
    if (!usable) {
      setQuoteZip("");
      return;
    }
    const timer = setTimeout(() => setQuoteZip(trimmed), 500);
    return () => clearTimeout(timer);
  }, [addressZip, addressCountry]);
  const [rates, setRates] = useState<AvailableShippingRate[]>([]);
  const [splitShipment, setSplitShipment] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [shippingPreview, setShippingPreview] = useState<{ shipping: number; tax: number; total: number; discount: number } | null>(null);

  // Real rate shopping: whenever the destination state changes, fetch every
  // eligible admin-configured rate for that zone + the current subtotal
  // (lib/shipping-rates.ts) and default to the cheapest — the customer can
  // still pick a faster one.
  useEffect(() => {
    // A state is only a prerequisite domestically — plenty of countries have
    // no equivalent, and requiring one there would leave checkout with no
    // shipping options at all.
    if (addressCountry === "US" && !addressState.trim()) {
      setRates([]);
      return;
    }
    let cancelled = false;
    setRatesLoading(true);
    getShippingRatesAction(addressState, cart.subtotal, addressCountry, quoteZip)
      .then((result) => {
        if (cancelled) return;
        setRates(result.rates);
        setSplitShipment(result.splitShipment);
        setSelectedRateId(result.rates[0]?.id ?? null);
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressState, addressCountry, quoteZip]);

  useEffect(() => {
    // Runs even with no rate selected. Every international destination has
    // no configured rates, and this preview is the only figure that knows
    // both the destination's tax treatment and its free-shipping rule —
    // without it the summary fell back to totals computed as if US.
    let cancelled = false;
    previewShippingTotalsAction(selectedRateId ?? "", addressState, applied?.code, addressCountry, quoteZip).then((result) => {
      if (cancelled || result.error) return;
      setShippingPreview({ shipping: result.shipping!, tax: result.tax!, total: result.total!, discount: result.discount! });
    });
    return () => {
      cancelled = true;
    };
  }, [selectedRateId, addressState, addressCountry, applied?.code, quoteZip]);

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoError(null);
    startApplying(async () => {
      const result = await applyPromoCodeAction(promoInput, addressCountry);
      if (result.error || !result.code) {
        setPromoError(result.error ?? "Couldn't apply this code");
        return;
      }
      setApplied({ code: result.code, discount: result.discount!, shipping: result.shipping!, tax: result.tax!, total: result.total! });
      toast.success(`Promo code ${result.code} applied`);
    });
  }

  function handleRemovePromo() {
    setApplied(null);
    setPromoInput("");
    setPromoError(null);
  }

  // Precedence: a chosen real carrier rate (once fetched) always reflects
  // the actual charge most accurately, so its preview — which itself
  // already accounts for any active promo/loyalty discount — wins over the
  // flat-rate promo/loyalty totals computed before a rate was known.
  const active = shippingPreview ?? applied ?? loyaltyDiscount;
  const shipping = active?.shipping ?? baseTotals.shipping;
  const tax = active?.tax ?? baseTotals.tax;
  const total = active?.total ?? baseTotals.total;
  const discount = active?.discount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <CheckoutForm
          defaultAddress={defaultAddress}
          promoCode={applied?.code ?? null}
          shippingRateId={selectedRateId}
          ratesAvailable={rates.length > 0}
          onAddressChange={(address) => {
            setAddressState(address.state);
            setAddressCountry(address.country || "US");
            setAddressZip(address.zip);
          }}
        />

        {(ratesLoading || rates.length > 0) && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Truck className="h-4 w-4" />
              Shipping Method
            </h2>
            {splitShipment && !ratesLoading && (
              // Asked for explicitly: the customer pays one shipping price but
              // receives two deliveries, because we dispatch our own stock and
              // CJ dispatches theirs. Saying so at checkout prevents the "where
              // is the rest of my order" message later.
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                This order ships in two parts — some items come direct from our supplier and may arrive separately.
                You&apos;ll get tracking for each as it leaves.
              </p>
            )}
            {ratesLoading ? (
              <p className="text-sm text-muted-foreground">Finding rates for your address...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {rates.map((rate) => (
                  <label
                    key={rate.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="shipping-rate"
                        checked={selectedRateId === rate.id}
                        onChange={() => setSelectedRateId(rate.id)}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      <span>
                        <span className="font-medium text-foreground">
                          {rate.carrierName ? `${rate.carrierName} ${rate.method}` : rate.method}
                        </span>
                        <span className="block text-xs text-muted-foreground">{rate.deliveryEstimate}</span>
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums font-medium text-foreground">
                      {rate.rate === 0 ? "Free" : formatPrice(rate.rate)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-fit rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Order Summary</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          {cart.items.map((line) => (
            <div key={line.itemId} className="flex justify-between text-muted-foreground">
              <span className="truncate pr-2">
                {line.product.title} × {line.quantity}
              </span>
              <span className="shrink-0 tabular-nums text-foreground">{formatPrice(line.product.price * line.quantity)}</span>
            </div>
          ))}
          <div className="mt-1 border-t border-border pt-2" />

          {applied ? (
            <div className="flex items-center justify-between rounded-md bg-success px-2 py-1.5 text-xs text-success">
              <span className="flex items-center gap-1.5 font-medium">
                <Tag className="h-3 w-3" />
                {applied.code} applied
              </span>
              <button
                type="button"
                onClick={handleRemovePromo}
                aria-label="Remove promo code"
                className="text-success/70 hover:text-success dark:hover:text-success"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 pb-1">
              {loyaltyDiscount && (
                <div className="flex items-center gap-1.5 rounded-md bg-warning px-2 py-1.5 text-xs font-medium text-warning">
                  <Award className="h-3 w-3" />
                  {loyaltyDiscount.tierName} member — {loyaltyDiscount.discountPercent}% off applied
                </div>
              )}
              <div className="flex gap-1.5">
                <Input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  className="h-8 font-mono text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyPromo();
                    }
                  }}
                />
                <Button type="button" size="sm" variant="outline" disabled={isApplying || !promoInput.trim()} onClick={handleApplyPromo}>
                  {isApplying ? "Applying..." : "Apply"}
                </Button>
              </div>
              {promoError && <p className="text-xs text-destructive">{promoError}</p>}
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums text-foreground">{formatPrice(cart.subtotal + cart.bundleDiscount)}</span>
          </div>
          {cart.bundleDiscount > 0 && (
            <div className="flex justify-between text-success">
              <span>Bundle savings</span>
              <span className="tabular-nums">-{formatPrice(cart.bundleDiscount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span className="tabular-nums">-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="tabular-nums text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span className="tabular-nums text-foreground">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
