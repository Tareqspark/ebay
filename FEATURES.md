# FEATURES.md

This is the detailed development plan for Baruashop, organized into the same five phases as the client-facing proposal (`Baruashop-Proposed-Feature-List.pdf`) and `PRODUCT.md`'s **Development roadmap** section. `PRODUCT.md` defines *what* and *why* at a glance; `CLAUDE.md` documents *how the current code works*; this file is the engineering-detail expansion of each phase — technical decisions (made or still open), checklists, and acceptance criteria.

**Phase numbering is deliberately identical across all three documents** — the proposal, `PRODUCT.md`, and this file — so a phase name means the same scope everywhere:

1. Storefront & Shopping Experience
2. Accounts, Cart & Checkout
3. Operations Console
4. Hybrid Supplier Sourcing
5. Advanced Capabilities

Phases 1, 2, and 3 are done, including the data layer and staff auth. Phase 4's UI and data are real; only the live CJdropshipping API connection itself is still mocked (5.1). Phase 5 is what's left — 5.2 (unified database) is now done as part of Phase 3; the rest (5.1, 5.3–5.6) is still full remaining scope.

---

## Current state (baseline)

- **Storefront (Phase 1):** live. Catalog, taxonomy, search, merchandising, and real customer reviews all run against real data — generated static files for catalog/taxonomy, real MySQL for reviews. Personalization is real but partial (purchase-history ranking only).
- **Accounts, cart, checkout (Phase 2):** live. Real MySQL-backed accounts, persistent cart, Stripe checkout, SendGrid email — see `db/schema.ts` for the schema and `CLAUDE.md` for the local dev setup.
- **Operations Console (Phase 3):** live. Every screen at `/admin/*` reads and writes the real MySQL tables that back the storefront — the entire generated-mock-data layer (`app/data/admin/*.ts`) has been retired from the admin console (`scripts/generate-admin-data.mjs` still exists only as the one-time seed source for `scripts/seed-db.ts`). A real order placed through checkout appears in `/admin/orders` immediately. `/admin/*` requires real staff authentication (a separate `admin_users` table, bcrypt, `/admin/login`) — customer accounts cannot reach it. Order fulfillment/cancel/refund/push-to-CJ, review moderation, CJ dispute resolution, product edits/delete, and manual inventory adjustment all persist for real and write to a real activity/audit log. Still UI-less (not just unwired — the create/edit UI itself doesn't exist yet): collections, content, marketing campaigns, shipping rates, and team invites. Category/brand taxonomy is still edited through `scripts/*-source.mjs`. Staff `role` is stored but not yet enforced per-screen.
- **Hybrid Supplier Sourcing (Phase 4):** UI and data layer are real; only the live CJdropshipping API connection is still mocked. The CJdropshipping module (`/admin/cj`) runs against a 50,000-item **generated snapshot** (`data/cj-catalog.json`) for the catalog, but orders/disputes/sourcing-requests/settings are real MySQL tables. "Push to CJ" and dispute resolution write real rows and log real activity — the CJ-side API call itself (getting a real CJ order ID, real status sync) is still mocked.
- **Advanced Capabilities (Phase 5):** 5.2 (unified database) is done — see Phase 3 above. 5.1, 5.3 (partial — auth exists, per-role enforcement doesn't), 5.4, 5.5, 5.6 are not started.
- **No test suite, no CI.** Unchanged from before this build — see *Cross-cutting work*.

---

## Guiding principles

1. **5.2 (unified database) is done**, which unblocked 5.3's real staff-auth foundation (a real `admin_users` table now exists) — role *gating* (any staff account can reach `/admin`) is live, though per-role *permission* enforcement (5.3's remaining piece) isn't. What's left in Phase 5 — real CJ integration (5.1), granular role permissions (5.3), search/personalization (5.4), pricing (5.5), fulfillment/trust (5.6) — no longer has a strict dependency order; pick by business priority.
2. **Keep the additive, non-breaking discipline this codebase already has.** Every Phase 5 item should be a data-source or backend swap under an unchanged component contract wherever possible — the same discipline already used to build Phases 1–4 (the CJ hybrid model, then the real commerce layer, both extended existing types rather than rewriting them).
3. **Money, category-tree shape, and ID conventions are frozen.** `PRODUCT.md`'s *Database conventions* section commits to these (integer cents, ULID primary keys); Phase 5 implements them for the remaining entities, it doesn't relitigate them.
4. **Don't let Phase 5 block on the vendor decisions still open.** Real CJ credentials, a hosted MySQL provider for production, and a staff-auth model are all things the business needs to decide — track them as open decisions (below), not blockers that stall engineering work that doesn't actually depend on them yet.

---

## Phase 1 — Storefront & Shopping Experience

**Status: done**, with one item carried into Phase 5.

What's live: three-level category taxonomy, full catalog with filter/sort, category-aware search with autocomplete, all merchandising rails (Deals, Flash Sale, Trending, New Arrivals, Best Sellers), real customer reviews (`db/schema.ts`'s `reviews` table, `lib/reviews-data.ts`, `lib/review-actions.ts`, one review per customer per product, auto-approved), and a first personalization pass (`lib/personalization.ts` ranks "Recommended For You" by a signed-in shopper's real purchase-history categories, falling back to the static top-rated heuristic for guests and first-time buyers).

**Remaining, tracked under Phase 5.4:**
- [ ] A dedicated search index (search is still `searchProducts()`'s substring match against the static catalog).
- [ ] Personalization that factors in browsing behavior, not just purchase history.
- [ ] Wishlist synced to the account (still a local-only UI stub — `components/product/wishlist-button.tsx` has no persistence).

---

## Phase 2 — Accounts, Cart & Checkout

**Status: done.** This was the largest single build in the project so far — real database, real auth, real payments, real email, all shipped together since checkout depends on all three.

### What was decided and built

| Decision | What shipped | Why |
|---|---|---|
| Database | **MySQL**, local dev via a scoped user on a shared MySQL 8 instance | Client requirement (MySQL specifically, not the originally-considered Postgres) — see *Open decisions* for the still-open production hosting choice. |
| ORM | **Drizzle ORM** (`mysql-core`) — `db/schema.ts`, `db/index.ts` | TypeScript-first, schema-as-code, no heavy codegen step — matches the codebase's existing "no abstraction beyond what's needed" discipline. |
| Auth | **Auth.js (NextAuth v5)**, credentials provider, bcrypt password hashing, JWT sessions | Free, self-hosted, first-class Next.js App Router support. JWT (not database) sessions because the Credentials provider doesn't pair with Auth.js's database-session adapter tables — see `CLAUDE.md`'s Edge/middleware gotcha for why this also required splitting `auth.config.ts` (edge-safe) from `auth.ts` (full, Node-only). |
| Payments | **Stripe**, Payment Intents + Payment Element | Server-computed totals (never trusted from the client), idempotent order creation driven by a webhook (`/api/webhooks/stripe`) with a same-result success-page fallback for environments without webhook forwarding configured. |
| Email | **SendGrid** | `lib/sendgrid.ts` degrades to a console log when `SENDGRID_API_KEY` is unset, so checkout completes in any environment without a live account. |
| Cart | DB-backed `carts`/`cart_items`, guest cookie merges into the user's cart on login | `lib/cart.ts`. |

### What's built

- [x] `users`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`, `reviews` tables (`db/schema.ts`).
- [x] Sign-up / sign-in / sign-out (`lib/auth-actions.ts`, `components/account/*`), session-aware header.
- [x] `/account` route family protected by `middleware.ts` (overview, order history, address book).
- [x] Persistent cart with guest-to-account merge (`lib/cart.ts`), live header badge (`components/cart/cart-badge.tsx`).
- [x] Checkout: address collection, Stripe Payment Element, server-verified totals (`lib/checkout.ts`, `lib/checkout-actions.ts`).
- [x] Order confirmation page + SendGrid receipt email (`lib/email-templates.ts`).

### Remaining

- [ ] **Activate production Stripe and SendGrid credentials** — no further development work, just filling in `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` / `SENDGRID_API_KEY` in the production environment.
- [x] **Inventory decrement on order.** Self-stocked items reduce real `inventory.available` (`lib/inventory.ts`'s `decrementInventoryForProduct`, called from `lib/checkout.ts`); CJ items don't, since CJ holds that stock. Checkout also now writes a real `payments` row.
- [ ] **Source-aware mixed-order shipping messaging** — self-stocked items ship same/next-day; CJ items carry CJ's 7–20+ day shipping-line estimates. The storefront checkout has no source-awareness yet (only the admin's hybrid model does). Decide: split-shipment messaging per item, or hold mixed orders to the slower estimate — a customer-trust product decision, not a technical one (see *Open decisions*).

---

## Phase 3 — Operations Console

**Status: done.** Every module reads real MySQL; core day-to-day mutations write for real; `/admin/*` requires real staff authentication.

### What's built

- **Real data layer.** `lib/admin/data.ts` and its satellite files (`categories.ts`, `collections.ts`, `content.ts`, `marketing.ts`, `shipping.ts`, `team.ts`, `api-keys.ts`, `reviews.ts`, `metrics.ts`) all query MySQL via `cache()`-wrapped Drizzle functions — the generated `app/data/admin/*.ts` files are no longer imported anywhere in the admin console (they, and `scripts/generate-admin-data.mjs`, now exist only as the one-time source `scripts/seed-db.ts` seeds from).
- **Real staff authentication.** A dedicated `admin_users` table (bcrypt password hashes, a `role` column, `status`), a separate `/admin/login` page and sign-in server action, and `middleware.ts` gating every `/admin/*` request before it renders — a signed-in customer account is rejected, only an active `admin_users` row can get in. `app/admin/(dashboard)/layout.tsx` threads the real signed-in staff member's name/email/role into the topbar (`components/admin/shell/user-menu.tsx`), replacing what used to be a hardcoded "Priya Patel".
- **Real mutations, with a real audit trail.** `lib/admin/activity.ts`'s `logActivity()` writes to `activity_events` from every action below and from checkout — the dashboard's activity feed reflects real admin (and customer) actions, not generated data.
  - Orders (`lib/admin/order-actions.ts`): mark shipped, cancel, refund (calls the real Stripe refund API when a PaymentIntent is on file and Stripe is configured), push to CJ.
  - Reviews (`lib/admin/review-actions.ts`): approve/reject.
  - CJ disputes (`lib/admin/cj-dispute-actions.ts`): resolve (reship/refund) / reject.
  - Products (`lib/admin/product-actions.ts`): price/cost edits, status/visibility (single + bulk), delete (real `DELETE`, safe because `order_items` keeps its own denormalized title/image/price snapshot rather than joining live to `products`).
  - Inventory (`lib/admin/inventory-actions.ts`): manual stock correction — this is new UI (the table was previously read-only), not just a rewire.
  - API keys (`lib/admin/api-key-actions.ts`): create/regenerate/revoke.
- Dashboard & KPIs, Orders/Products/Inventory/Customers/Payments/Reviews/Shipping tables and detail panels, the full Settings suite — all reading live data end to end.

### Remaining

- [ ] **Build create/edit UI for collections, content (CMS pages/banners), marketing campaigns, shipping rates, and staff invites.** These five screens are still read-only lists reading real data — there's no create/edit affordance to wire yet (unlike the items above, where working-but-fake UI already existed and just needed a real write behind it).
- [ ] **Category/collection editing and homepage rail configuration through the console** instead of hand-editing `scripts/*-source.mjs` — fulfills the Catalog Manager and Merchandiser roles described in `PRODUCT.md`'s *User roles*.
- [ ] **Per-role permission enforcement** (Phase 5.3) — any active `admin_users` row can reach every screen today; the `role` column (Owner/Admin/Merchandiser/Support/Catalog Manager) is stored and displayed but nothing checks it yet.

**Acceptance criteria — met:** a full admin session (mark an order shipped, edit a product, resolve a dispute) survives a server restart with all changes intact, and every action is attributable to the signed-in staff member who made it.

---

## Phase 4 — Hybrid Supplier Sourcing

**Status: UI and data layer built, live API connection is not.** The dedicated CJdropshipping module (`/admin/cj` — Overview, Catalog, Orders, After-Sales, Sourcing Requests, Settings) is fully built and was deliberately designed so that going live is a backend swap, not a UI rewrite: `onPushToCj` and dispute resolve/reject (`lib/admin/order-actions.ts`, `lib/admin/cj-dispute-actions.ts`) already write real rows to `orders`/`cj_disputes` and log real activity — only the actual CJ-side API call is mocked (a random CJ order ID is generated locally; there's no live status sync back). Sourcing-request submission is still UI-only.

### What's built (UI + generated catalog + real order/dispute data)

- 50,000-item searchable/filterable CJ catalog (`lib/admin/cj-catalog.ts` reads `data/cj-catalog.json` server-only, paginated via `/api/admin/cj-catalog`), bulk import.
- Fulfillment queue (`/admin/cj/orders`) with bulk "Push to CJ", per-order sync status, shipping-line selection.
- After-sales claims workflow with amount-at-risk KPIs (`/admin/cj/after-sales`).
- Sourcing requests (`/admin/cj/sourcing`).
- Supplier account/wallet/shipping-line settings (`/admin/cj/settings`).

### Remaining — the whole of Phase 5.1

- [ ] Real CJdropshipping API account + credentials (see *Open decisions*).
- [ ] Scheduled catalog sync into a `cj_catalog_items` table, replacing the static JSON snapshot.
- [ ] Real order push, tracking, and after-sales claim submission through the CJ API.
- [ ] Failure-mode handling the mock can't produce: rate limits, sync failures, account disconnection.

---

## Phase 5 — Advanced Capabilities

Everything Phases 2–4 deferred. Six sub-areas; 5.2 is done (folded into Phase 3), the rest are not started.

### 5.1 — Real-Time Supplier Integration

| Decision | Recommendation | Why |
|---|---|---|
| Catalog sync | Scheduled sync (cron) into a `cj_catalog_items` table, not a live pass-through per request | 50k–100k items can't be fetched from CJ synchronously on every admin page load. |
| Order push / status | CJ API call on push + **webhook** for status changes, with a scheduled polling fallback | Don't rely on webhooks alone for a production, money-adjacent flow. |
| Background jobs | A cron mechanism for scheduled sync, a real queue (e.g. Inngest, Upstash QStash) for async order-push/webhook processing | Raw serverless functions have execution-time limits unsuitable for bulk syncing or retry-with-backoff. |

- [ ] Real CJ account + API credentials; replace `CJ_INTEGRATION_SETTINGS` mock with a real, encrypted-at-rest credential store (keep the existing masked-display pattern).
- [ ] `cj_catalog_items` table + scheduled sync job; `getCjCatalogTotal()`/`searchCjCatalog()` swap `fs.readFileSync` for a DB query — same function signatures, zero UI changes.
- [ ] Real "Push to CJ", real order-status webhook (`/api/webhooks/cj`), real wallet balance fetch.
- [ ] Real after-sales dispute submission and sourcing-request submission through the CJ API.
- [ ] New failure-mode UI: rate limits, sync failures, account disconnection — none of this exists today because the mock can't fail.

**Acceptance criteria:** every CJ-facing admin action round-trips through the real API with no UI changes beyond error/loading states; the 50k-item catalog page still paginates responsively against a live-synced table.

### 5.2 — Unified Operations Database — done

Landed as part of Phase 3 rather than as a separate later phase. `db/schema.ts` covers every admin entity (products, categories, brands, inventory, suppliers, disputes, payments, and the rest); `lib/admin/data.ts` and its satellite files query MySQL directly; real orders placed through checkout are immediately visible and actionable in `/admin/orders`; inventory decrements by source on checkout; the dashboard's activity feed is a real, persisted audit log. See Phase 3 above for the full breakdown.

**Acceptance criteria — met:** the storefront and admin console run against the same MySQL database.

### 5.3 — Team Roles & Permissions — partially done

**What's done:** real staff sign-in (a dedicated `admin_users` table, kept fully separate from customer `users` — the identity-model decision below is resolved), `middleware.ts` gates every `/admin/*` route and redirects unauthenticated/non-staff requests to `/admin/login`, and the signed-in staff member's real identity (name/email/role) shows in the topbar.

**What's remaining:**
- [ ] Per-module permission checks (e.g. Support Agent can act on orders/disputes but not edit products; Catalog Manager can't touch payments) — the `role` column exists and is displayed but nothing branches on it yet.
- [ ] `/admin/settings/users` is still a read-only list — wire it to real role mutations (invite, change role, deactivate).

**Acceptance criteria:** an unauthenticated request to any `/admin/*` route redirects to a staff sign-in page — **met**; a signed-in Catalog Manager cannot reach Payments settings — **not yet**; a signed-in Admin can reach everything — met (currently true of every role, which is exactly the gap above).

### 5.4 — Enhanced Discovery & Personalization

- [ ] Dedicated search index (Meilisearch, Typesense, or Algolia) behind the existing search bar UI; `searchProducts()` string matching becomes the fallback, not the primary path.
- [ ] Personalization that factors in browsing behavior over time, not just purchase history (extends `lib/personalization.ts`).
- [ ] Wishlist saved to the account and synced across devices, replacing the current local-only stub.

### 5.5 — Pricing & Promotions

- [ ] Promo codes applied at checkout.
- [ ] Loyalty / tiered pricing for repeat customers.
- [ ] Bundle discounts for related products purchased together.

Per `PRODUCT.md`'s *Pricing strategy* section, these were explicitly out of scope until the cart/checkout module existed (Phase 2) — that's now done, so this becomes buildable rather than purely aspirational.

### 5.6 — Customer Trust & Fulfillment

- [ ] Returns & refunds workflow for self-stocked items, distinct from the CJ after-sales claims flow (Phase 4 / 5.1) — a different process for a different sourcing model.
- [ ] Real carrier shipping integration (rate shopping, label generation) for self-stocked orders.
- [ ] Analytics & A/B testing infrastructure.

---

## Cross-cutting work (not a phase — needed throughout Phase 5)

- [ ] **Test suite.** Still none (`CLAUDE.md`: "There is no test suite/runner configured"). Recommend **Vitest** for `lib/*` query/action functions, **Playwright** for E2E on checkout and admin-mutation flows — the two places a silent regression costs real money or real data integrity. Should have started with Phase 2; the admin console's query and mutation layer (Phase 3, now real) is exactly the kind of surface that benefits most from starting this before it grows further.
- [ ] **CI.** GitHub Actions: typecheck + lint + test on every PR, matching the commands in `CLAUDE.md`.
- [x] **Environment/secrets management** — `.env.local` (gitignored) already holds `DATABASE_URL`, `AUTH_SECRET`/`AUTH_URL`, and the Stripe/SendGrid keys (empty pending production credentials). Remaining: the same pattern for real CJ API credentials once Phase 5.1 needs them, and a production secrets story (environment variables per deploy target — the hosting decision below affects exactly what that looks like).
- [ ] **Observability.** Error tracking (e.g. Sentry) is close to non-negotiable once Phase 5.1's payment-adjacent and supplier-sync flows are live — a failed webhook or sync with no visibility is a silent revenue or fulfillment leak.
- [ ] **Deployment.** No production deployment target has been chosen yet (see *Open decisions*).

---

## Suggested immediate next steps

1. **Build the five still-UI-less admin screens** (collections, content, marketing campaigns, shipping rates, team invites) — the clearest remaining Phase 3 gap, and the one most likely to be visibly missing to a client demo.
2. **Add per-role permission checks** (Phase 5.3's remaining piece) — the data (`admin_users.role`) already exists; this is purely an authorization-logic task now, not a schema or auth-flow one.
3. **Resolve the two open infrastructure decisions below** (production MySQL hosting, real CJ API access) — both block real Phase 5.1 work from starting, even though neither blocks continuing to build against local MySQL in the meantime.

## Open decisions requiring product/business input (not engineering calls)

| Decision | Why it can't be made in code |
|---|---|
| Production MySQL hosting | Local dev uses a scoped user on a shared MySQL 8 instance — fine for development, not for production. Needs a real hosting decision (managed MySQL provider, self-hosted, etc.) before Phase 5 work ships anywhere real. |
| Real CJdropshipping API access | Phase 5.1 cannot start without the business's actual CJ developer account and credentials — this is an account-acquisition step, not an engineering one. |
| Self vs. CJ catalog mix going forward | Currently a mock 65/35 split, seeded into real `product_meta.source` rows but with no real merchandising rationale behind the split itself — which categories/bestsellers stay self-stocked vs. CJ-only drives margin and shipping-time consistency. |
| Mixed-order shipping messaging | Flagged in Phase 2 above — split-shipment UI vs. holding to the slower estimate is a customer-trust tradeoff, not a technical one. |
| CJ after-sales SLA | Whether dispute resolution stays a manual ops workflow or becomes a customer-facing automated flow once Phase 5.1 wires real CJ claim submission. |
| Per-role permission boundaries | *(Resolved: staff identity is a separate `admin_users` table, not a `role` column on customer `users`.)* Still open: exactly which screens/actions each of the five roles (Owner/Admin/Merchandiser/Support/Catalog Manager) should be allowed to reach — a policy decision Phase 5.3's remaining enforcement work needs before it can be built. |
