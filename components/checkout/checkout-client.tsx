"use client";

import { useState, useTransition } from "react";
import { Award, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { applyPromoCodeAction } from "@/lib/promo-actions";
import { formatPrice } from "@/lib/format";
import type { ShippingAddressInput } from "@/lib/checkout-actions";
import type { CartSummary } from "@/lib/cart";

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

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoError(null);
    startApplying(async () => {
      const result = await applyPromoCodeAction(promoInput);
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

  // A promo code always wins over the automatic loyalty-tier discount —
  // mirrors the mutual-exclusivity rule enforced server-side in
  // createPaymentIntentAction.
  const active = applied ?? loyaltyDiscount;
  const shipping = active?.shipping ?? baseTotals.shipping;
  const tax = active?.tax ?? baseTotals.tax;
  const total = active?.total ?? baseTotals.total;
  const discount = active?.discount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <CheckoutForm defaultAddress={defaultAddress} promoCode={applied?.code ?? null} />
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
            <div className="flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Tag className="h-3 w-3" />
                {applied.code} applied
              </span>
              <button
                type="button"
                onClick={handleRemovePromo}
                aria-label="Remove promo code"
                className="text-emerald-700/70 hover:text-emerald-900 dark:text-emerald-400/70 dark:hover:text-emerald-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 pb-1">
              {loyaltyDiscount && (
                <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
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
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Bundle savings</span>
              <span className="tabular-nums">-{formatPrice(cart.bundleDiscount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
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
