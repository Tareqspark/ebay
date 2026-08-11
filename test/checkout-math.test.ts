import { describe, it, expect } from "vitest";
import {
  computeTotals,
  computeTotalsWithDiscount,
  baseShippingFor,
  amountToFreeShipping,
  DEFAULT_SHIPPING_RULE,
  FREE_SHIPPING_THRESHOLD,
  FLAT_SHIPPING,
  TAX_RATE,
  type ShippingRule,
} from "@/lib/checkout-math";

describe("computeTotals", () => {
  it("charges flat shipping below the free-shipping threshold", () => {
    const { shipping } = computeTotals(FREE_SHIPPING_THRESHOLD - 0.01);
    expect(shipping).toBe(FLAT_SHIPPING);
  });

  it("is free exactly at the threshold, not just above it", () => {
    expect(computeTotals(FREE_SHIPPING_THRESHOLD).shipping).toBe(0);
  });

  it("is free for a zero subtotal (e.g. an all-gift-card order)", () => {
    expect(computeTotals(0).shipping).toBe(0);
  });

  it("computes tax on subtotal + shipping, not on subtotal alone", () => {
    const subtotal = 40;
    const { shipping, tax } = computeTotals(subtotal);
    expect(shipping).toBe(FLAT_SHIPPING);
    expect(tax).toBe(Math.round((subtotal + shipping) * TAX_RATE * 100) / 100);
  });

  it("total is subtotal + shipping + tax", () => {
    const subtotal = 100;
    const { shipping, tax, total } = computeTotals(subtotal);
    expect(total).toBe(Math.round((subtotal + shipping + tax) * 100) / 100);
  });

  it("a real chosen shipping rate overrides the flat/free logic entirely, even above the free threshold", () => {
    // Regression: this is the exact bypass found during QA — a customer
    // choosing a paid carrier rate on an order that would otherwise qualify
    // for free shipping must still be charged that rate, not get it free.
    const { shipping } = computeTotals(FREE_SHIPPING_THRESHOLD + 100, 24.99);
    expect(shipping).toBe(24.99);
  });

  it("a shipping override of exactly 0 is honored, not treated as 'no override'", () => {
    const { shipping } = computeTotals(FREE_SHIPPING_THRESHOLD - 10, 0);
    expect(shipping).toBe(0);
  });
});

describe("computeTotalsWithDiscount", () => {
  it("matches computeTotals when there's no promo", () => {
    const subtotal = 75;
    const withNoPromo = computeTotalsWithDiscount(subtotal);
    const base = computeTotals(subtotal);
    expect(withNoPromo.shipping).toBe(base.shipping);
    expect(withNoPromo.tax).toBe(base.tax);
    expect(withNoPromo.total).toBe(base.total);
    expect(withNoPromo.discount).toBe(0);
  });

  it("applies a percent discount to the subtotal before tax", () => {
    const result = computeTotalsWithDiscount(100, { discountType: "percent", discountPercent: 20, discountAmountCents: null });
    expect(result.discount).toBe(20);
    // Free shipping already applies at $100, so tax is on the discounted $80.
    expect(result.tax).toBe(Math.round(80 * TAX_RATE * 100) / 100);
  });

  it("applies a fixed-amount discount", () => {
    const result = computeTotalsWithDiscount(100, { discountType: "fixed", discountPercent: null, discountAmountCents: 1500 });
    expect(result.discount).toBe(15);
  });

  it("clamps a percent/fixed discount so it can never exceed the subtotal", () => {
    const percentResult = computeTotalsWithDiscount(10, { discountType: "percent", discountPercent: 100, discountAmountCents: null });
    expect(percentResult.discount).toBe(10);

    const fixedResult = computeTotalsWithDiscount(10, { discountType: "fixed", discountPercent: null, discountAmountCents: 5000 });
    expect(fixedResult.discount).toBe(10);
  });

  it("free_shipping waives only the shipping fee, not the product subtotal", () => {
    const subtotal = 30; // below the free-shipping threshold, so it would normally cost FLAT_SHIPPING
    const result = computeTotalsWithDiscount(subtotal, { discountType: "free_shipping", discountPercent: null, discountAmountCents: null });
    expect(result.shipping).toBe(0);
    expect(result.discount).toBe(FLAT_SHIPPING);
    // The product subtotal itself isn't discounted — tax is on the full subtotal, just with $0 shipping.
    expect(result.tax).toBe(Math.round(subtotal * TAX_RATE * 100) / 100);
  });

  it("free_shipping waives the real chosen carrier rate, not the flat rate, when one was picked", () => {
    const result = computeTotalsWithDiscount(
      100,
      { discountType: "free_shipping", discountPercent: null, discountAmountCents: null },
      24.99 // a paid carrier rate the customer picked, overriding the free-shipping-threshold logic
    );
    expect(result.shipping).toBe(0);
    expect(result.discount).toBe(24.99);
  });
});

describe("international orders", () => {
  it("charges US sales tax on a domestic order", () => {
    const { tax } = computeTotals(100, 10, "US");
    expect(tax).toBeCloseTo(9.08, 2);
  });

  it("charges no US sales tax on an export", () => {
    // The overseas buyer pays their own country's import duty and VAT on
    // arrival; billing them US state tax would be charging for a liability
    // that doesn't exist.
    const { tax, total } = computeTotals(100, 10, "DE");
    expect(tax).toBe(0);
    expect(total).toBe(110);
  });

  it("defaults to taxable when no country is given, so existing callers are unchanged", () => {
    expect(computeTotals(100, 10).tax).toBeCloseTo(computeTotals(100, 10, "US").tax, 2);
  });

  it("drops tax on a discounted international order too", () => {
    const { tax, discount } = computeTotalsWithDiscount(
      200,
      { discountType: "percent", discountPercent: 10, discountAmountCents: null },
      0,
      "GB"
    );
    expect(discount).toBe(20);
    expect(tax).toBe(0);
  });

  it("is case- and whitespace-insensitive about the country code", () => {
    expect(computeTotals(100, 0, " us ").tax).toBeGreaterThan(0);
    expect(computeTotals(100, 0, "gb").tax).toBe(0);
  });
});

/**
 * Per-country shipping rules. The default is the historical flat behaviour,
 * so every pre-existing caller that passes no rule must keep charging what
 * it charged before — the tests above cover that; these cover overrides.
 */
describe("per-country shipping rules", () => {
  const NO_FREE: ShippingRule = { freeShippingEnabled: false, threshold: 50, flatRate: 24.99 };
  const HIGH_BAR: ShippingRule = { freeShippingEnabled: true, threshold: 150, flatRate: 19.99 };

  it("uses the default rule when none is passed", () => {
    expect(baseShippingFor(FREE_SHIPPING_THRESHOLD - 0.01)).toBe(FLAT_SHIPPING);
    expect(baseShippingFor(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(DEFAULT_SHIPPING_RULE.threshold).toBe(FREE_SHIPPING_THRESHOLD);
    expect(DEFAULT_SHIPPING_RULE.flatRate).toBe(FLAT_SHIPPING);
  });

  it("never waives shipping for a country with free shipping switched off", () => {
    // The leak this feature exists to close: a $500 order to a destination
    // that costs far more than $6.99 to reach must still be charged.
    expect(baseShippingFor(500, NO_FREE)).toBe(24.99);
    expect(amountToFreeShipping(500, NO_FREE)).toBeNull();
  });

  it("still charges nothing on an empty cart even with free shipping off", () => {
    expect(baseShippingFor(0, NO_FREE)).toBe(0);
  });

  it("honours a raised threshold", () => {
    expect(baseShippingFor(149.99, HIGH_BAR)).toBe(19.99);
    expect(baseShippingFor(150, HIGH_BAR)).toBe(0);
    expect(amountToFreeShipping(100, HIGH_BAR)).toBe(50);
    expect(amountToFreeShipping(150, HIGH_BAR)).toBe(0);
  });

  it("reports the remaining amount without floating-point crumbs", () => {
    // 50 - 31.99 in binary floating point is 18.009999999999998.
    expect(amountToFreeShipping(31.99)).toBe(18.01);
  });

  it("carries the rule through computeTotals", () => {
    expect(computeTotals(500, undefined, "BD", NO_FREE).shipping).toBe(24.99);
    // A chosen carrier rate still wins over the country rule.
    expect(computeTotals(500, 12.5, "BD", NO_FREE).shipping).toBe(12.5);
  });

  it("carries the rule through computeTotalsWithDiscount", () => {
    const { shipping } = computeTotalsWithDiscount(500, null, undefined, "BD", NO_FREE);
    expect(shipping).toBe(24.99);
  });

  it("lets a free_shipping promo waive a rule that never gives free shipping", () => {
    // The promo waives whatever shipping was due, which is the point of it.
    const { shipping, discount } = computeTotalsWithDiscount(
      500,
      { discountType: "free_shipping", discountPercent: null, discountAmountCents: null },
      undefined,
      "BD",
      NO_FREE
    );
    expect(shipping).toBe(0);
    expect(discount).toBe(24.99);
  });

  it("keeps international orders untaxed regardless of the rule", () => {
    expect(computeTotals(500, undefined, "BD", NO_FREE).tax).toBe(0);
    expect(computeTotals(500, undefined, "US", NO_FREE).tax).toBeGreaterThan(0);
  });
});
