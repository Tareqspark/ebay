/**
 * Refunds an item's proportional share of what was actually paid, not its
 * raw undiscounted price — an order-level discount (promo code, loyalty
 * tier, or bundle) reduces every line item's effective price together, so
 * a returned item should give back less than its sticker price if the
 * order got a discount. Extracted from lib/return-actions.ts's
 * requestReturnAction so this specific calculation — the exact one that
 * previously overpaid customers by ignoring order-level discounts — can be
 * unit-tested without a database or an authenticated session.
 */
export function computeProportionalRefundCents(
  itemLineTotalCents: number,
  orderSubtotalCents: number,
  orderDiscountCents: number
): number {
  const proportionalDiscountCents =
    orderSubtotalCents > 0 ? Math.round((itemLineTotalCents / orderSubtotalCents) * orderDiscountCents) : 0;
  return Math.max(0, itemLineTotalCents - proportionalDiscountCents);
}
