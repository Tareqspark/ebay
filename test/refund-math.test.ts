import { describe, it, expect } from "vitest";
import { computeProportionalRefundCents } from "@/lib/refund-math";

describe("computeProportionalRefundCents", () => {
  it("refunds the full item price when the order had no discount", () => {
    expect(computeProportionalRefundCents(2000, 5000, 0)).toBe(2000);
  });

  it("regression: proportions a 20%-off order's discount onto the returned item", () => {
    // The exact bug found during QA: returning one item from a discounted
    // order used to refund its full undiscounted price, overpaying the
    // customer by the discount share that item should have absorbed.
    // $50 order, 20% off ($10 discount) → an item that was $20 of that $50
    // subtotal should get back $20 - ($20/$50 * $10) = $16, not $20.
    const itemLineTotalCents = 2000;
    const orderSubtotalCents = 5000;
    const orderDiscountCents = 1000;
    expect(computeProportionalRefundCents(itemLineTotalCents, orderSubtotalCents, orderDiscountCents)).toBe(1600);
  });

  it("combines promo + bundle discount proportionally (caller sums both into orderDiscountCents)", () => {
    // $100 subtotal, $30 total discount, item is $40 of it → refund
    // 40 - (40/100 * 30) = 28.
    expect(computeProportionalRefundCents(4000, 10000, 3000)).toBe(2800);
  });

  it("never returns a negative refund even if the discount exceeds the item's share", () => {
    expect(computeProportionalRefundCents(100, 100, 10000)).toBe(0);
  });

  it("does not divide by zero when the order subtotal is zero", () => {
    expect(computeProportionalRefundCents(0, 0, 0)).toBe(0);
  });
});
