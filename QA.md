# QA Report — 2026-07-29

Adversarial, human-style QA pass against the running dev app (real DB, real
sessions, real server actions via curl — not just code review). Covers two
things: fresh exploration looking for new bugs, and regression verification
of everything built earlier today (test suite, CI, active alerting, and the
`checkout.ts` / `return-actions.ts` refactors). This is a report only —
nothing below has been fixed.

## Findings

### 1. [Critical] `addToCart` accepts a negative quantity with no server-side validation — reduces the cart subtotal and inflates inventory on purchase

**Where:** `lib/cart.ts:109`, `addToCart(productId, quantity)`

**Repro:** Call the `addToCart` server action directly with a negative
quantity (bypassing the client's quantity stepper, which never lets you
type a negative number — but nothing stops a raw request):

```
POST /product/<slug>  Next-Action: <addToCart id>
["p-adidas-everyday-joggers", -5]
```

Verified live: the row lands in `cart_items` with `quantity = -5` exactly
as sent. No clamping, no rejection.

**Impact — two compounding problems:**
- **Subtotal manipulation.** `buildSummary()` (`lib/cart.ts:96`) sums
  `quantity * price` across every line via
  `computeBundleAdjustedSubtotal`. A negative-quantity line subtracts from
  the subtotal instead of adding to it — a customer can add an expensive
  item at quantity 1 and the same or a different item at a negative
  quantity to reduce (or zero out, or make negative) what they're charged
  for real items they'll still receive.
- **Inventory inflation.** If that order completes, `lib/checkout.ts`
  calls `decrementInventoryForProduct(productId, quantity)`
  (`lib/inventory.ts:22`) for every self-sourced line item:
  ```ts
  const nextAvailable = Math.max(0, row.available - quantity);
  ```
  With a negative `quantity`, `row.available - quantity` *increases*
  available stock. A completed "purchase" with a negative-quantity line
  adds phantom inventory instead of removing it.

**Suggested fix (not applied):** reject non-positive, non-integer
quantities in `addToCart` the same way `updateCartItemQuantity` already
treats `quantity <= 0` specially (it deletes the line instead of storing a
non-positive quantity) — `addToCart` has no equivalent guard at all.

### 2. [High] No stock-availability check anywhere in the cart or checkout path

**Where:** `lib/cart.ts`, `lib/checkout.ts`, `lib/checkout-actions.ts` —
none of them reference `inventory.available`.

**Repro:** Add a quantity of a self-sourced product larger than its
`inventory.available` count (or just repeatedly increase quantity on a
low-stock item past what's in stock) and proceed through checkout. Nothing
in the add-to-cart, checkout-preview, or payment-intent-creation path
checks the requested quantity against real stock. `decrementInventoryForProduct`
only clamps the *result* at 0 after the fact — it never blocks the order
from being placed in the first place.

**Impact:** a store can oversell a limited-stock item indefinitely; the
admin Inventory screen would show `available: 0` while orders for that
product keep succeeding.

**Suggested fix (not applied):** check `inventory.available` against
requested quantity at both add-to-cart time (soft warning) and
payment-intent-creation time (hard block, since that's the actual
money-committing step — same reasoning already applied to promo-code
reservation in `lib/promo.ts`'s `reservePromoUsage`).

## Verified working (regression pass on today's changes)

- **`lib/checkout-math.ts` extraction** (pulled `computeTotals` /
  `computeTotalsWithDiscount` out of `lib/checkout.ts` so they're
  unit-testable). Live-verified against a real cart: a $29.99 item priced
  a $40.03 total with no discount and, for a real Platinum-tier customer,
  correctly discounted to $37.43 — hand-checked to the cent against the
  8% loyalty math.
- **`lib/refund-math.ts` extraction** (pulled the proportional-refund
  calculation out of `requestReturnAction`). Live-verified with a real
  order ($50 subtotal, $10 discount) and a real return request through
  the actual `requestReturnAction` server action: a $20 line item
  refunded exactly $16.00 (`refund_amount_cents = 1600`), matching the
  discount-proportioning math by hand.
- **Login brute-force lockout**: 6 wrong passwords against a real staff
  account locked it out; the 7th attempt with the *correct* password was
  still rejected (session stayed unauthenticated).
- **Active error alerting** (new today): triggering a real error called
  `logError()` → persisted to `error_logs` → attempted an email to the
  Owner (logged to console since SendGrid is unconfigured, as designed).
  A second identical error within the 30-minute window was correctly
  suppressed — no duplicate alert.
- **RBAC** (page-level and action-level, built earlier today/this week):
  spot-re-verified after all of today's refactors — unaffected, still
  enforced.
- **Stripe-unconfigured checkout path**: `createPaymentIntentAction`
  still returns a clean, actionable error ("Payments aren't configured
  yet…") rather than crashing.
- **59 unit tests pass** covering money rounding, checkout math (including
  the exact shipping-threshold-bypass and discount-clamping scenarios from
  earlier QA fixes), refund proportioning, loyalty tier boundaries,
  RBAC pathname mapping, rate limiting, and the stored-XSS/CSV-injection
  guards (`lib/sanitize.ts`).

## Not covered in this pass

Full storefront browse/search/reviews flows, admin CSV export, and the
CJ dispute/sourcing flows weren't re-tested this round — this pass focused
on today's changes (checkout/return refactors, alerting) plus fresh
exploration around cart/inventory, which is where the two findings above
turned up.
