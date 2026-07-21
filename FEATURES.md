# FEATURES.md

This is the detailed development plan for taking Baruashop from its current state — a frontend + admin **prototype running entirely on generated mock data** — to a production system. `PRODUCT.md` defines *what* and *why*; `CLAUDE.md` documents *how the current code works*; this file is *the sequenced, actionable plan for what to build next*, broken into phases with concrete technical decisions, checklists, and acceptance criteria.

Every phase below maps onto `PRODUCT.md`'s **Development roadmap** section — this document is that roadmap expanded into engineering detail.

---

## Current state (baseline)

Everything today is a `Server Component reads a generated TS array` or `client component calls useState` pattern. Nothing survives a page reload except `localStorage` (recently-viewed, recent searches). Concretely:

- **Storefront**: catalog/taxonomy/search/merchandising are fully live against `app/data/*.ts` (generated from `scripts/*-source.mjs`). Cart, accounts, checkout do not exist.
- **Admin console**: fully built UI (`/admin/*`) — products, orders, inventory, categories, collections, customers, marketing, supplier, CJdropshipping, payments, analytics, shipping, content, settings. All data comes from `app/data/admin/*.ts` (generated) and `data/cj-catalog.json` (50k static items). All "mutations" (mark shipped, push to CJ, resolve dispute, edit a row) are local `useState` writes that vanish on refresh. No auth — `/admin` is wide open.
- **No database, no auth, no payment provider, no test suite, no CI.**

This plan exists because none of the above is a small task, and doing them in the wrong order creates rework (e.g. building checkout before there's a database to persist orders to).

---

## Guiding principles for this plan

1. **Database before anything that needs to persist.** Cart, checkout, admin mutations, and real CJ sync all require durable storage — this is Phase 1, not optional infrastructure to defer.
2. **Auth before checkout and before admin gets a network-reachable deploy.** An unauthenticated `/admin` with real mutating API routes behind it is a much worse position than the current mock-data version.
3. **Keep the additive, non-breaking discipline this codebase already has.** Every phase should be a data-source swap under an unchanged component contract wherever possible (the same discipline used for the CJ hybrid model — `Product`/`Order`/`Category` types gained fields, they weren't rewritten).
4. **Money, category-tree shape, and the `[top, child, grandchild]` slug-path contract are frozen.** `PRODUCT.md`'s *Database conventions* section already commits to these; this plan implements them, it doesn't relitigate them.
5. **Ship the storefront-facing money path (cart → checkout → payment) before polishing anything else.** It's the only phase directly tied to revenue.

---

## Phase 1 — Data foundation (real database)

**Goal:** every entity currently generated into a static file becomes a real, persisted, queryable row — with the exact same shapes `lib/*.ts` already exposes, so components don't change.

### Key decisions

| Decision | Recommendation | Why |
|---|---|---|
| Database | **MySQL via PlanetScale** | Serverless-friendly (scales to zero, branch-per-preview-deploy pairs naturally with Vercel preview deployments — PlanetScale's signature feature, built on Vitess), no server management. **Caveat:** PlanetScale's Vitess layer historically didn't enforce foreign key constraints; they reintroduced FK support in 2024 for non-sharded databases (this app's scale won't need sharding), but confirm current FK support before committing, or enforce referential integrity at the Drizzle/application layer as a fallback. If traditional FK constraints matter more than DB branching, a plain managed MySQL host (Railway, AWS RDS) is the alternative — full FK support, no schema-branching workflow. |
| ORM | **Drizzle ORM** (`mysql-core`) | TypeScript-first, schema-as-code, SQL-shaped queries (no heavy codegen step), lightweight — matches this codebase's existing "no abstraction beyond what's needed" discipline better than Prisma's generated client. Drizzle's MySQL dialect is equally first-class to its Postgres one. Prisma remains a fine alternative if the team prefers Prisma Studio and more batteries-included migrations. |
| Validation | **zod** | Already the stated convention in `PRODUCT.md`'s API conventions section. |
| Money | **Integer cents** everywhere in the DB and API layer | Per `PRODUCT.md`'s existing Database conventions. `formatPrice()`/`formatMoney()` become the single float-conversion boundary at render time. |

### Schema (from `PRODUCT.md`'s Database conventions, made concrete)

- `categories` (self-referencing `parent_id` + `level` enum, OR three explicit tables — pick self-referencing to avoid triple-maintaining near-identical tables), `brands`, `products` (FK to leaf category, denormalized `category_slug_path`), `product_meta` (source: self/cj, cost, CJ fields — mirrors today's `AdminProductMeta`), `inventory`, `suppliers`. MySQL note: use `CHAR(26)` for ULID primary keys (no native UUID type), `DECIMAL`/`BIGINT` are fine for the integer-cents money convention, and category/brand JSON-ish fields (e.g. `features`) use MySQL's native `JSON` column type (5.7+/8+, already assumed).
- `users`, `addresses`, `sessions` (shape driven by Phase 2's auth choice).
- `carts`, `cart_items` (Phase 3).
- `orders`, `order_items`, `payments`, `disputes`, `cj_disputes`, `cj_sourcing_requests`.
- `reviews` (Phase 6, but worth including in the initial schema pass since `Product` already has a rating shape).

### Checklist

- [ ] Stand up PlanetScale MySQL database; wire `DATABASE_URL` via Vercel env vars (`.env.local` for dev, never committed).
- [ ] Define Drizzle schema for the full entity list above, matching existing `lib/types.ts` / `lib/admin/types.ts` field names so the mapping layer is thin.
- [ ] Migration tooling: `drizzle-kit` generate + push, one linear history, committed to `db/migrations/`.
- [ ] Seed scripts: repurpose `scripts/*-source.mjs` as seed data (they already are the hand-authored source of truth for taxonomy/brands) — write a `scripts/seed.mjs` that inserts them via Drizzle instead of (or in addition to) generating static `.ts` files.
- [ ] Rewrite `lib/products.ts` / `lib/category-utils.ts` / `lib/admin/data.ts` query functions to hit the DB instead of the in-memory arrays — **keep the exact same exported function signatures** so calling components need zero changes.
- [ ] Decide the fate of `app/data/*.ts` generation: keep it as a fast local-dev fallback / fixture generator for seeding, or retire it once the DB is the only source of truth. (Recommendation: keep the generators, repoint them at the seed script instead of static-file output.)
- [ ] `data/cj-catalog.json` (50k items, 17MB): stays as the CJ catalog cache for now — this becomes the seed for a `cj_catalog_items` table in Phase 4, not Phase 1 (it's not core commerce data, and re-platforming it can happen alongside the real CJ API work).

**Acceptance criteria:** the storefront and admin console both run against MySQL with zero visible behavior change (same pages, same data shapes) — this phase should be invisible to a user, and is verified by that invisibility plus `npx tsc --noEmit` / lint / a full click-through matching current behavior.

**Est:** 2–3 weeks for one engineer, given the schema surface (15+ tables) and the need to rewrite every query helper without changing its contract.

---

## Phase 2 — Accounts & auth

**Goal:** `Guest Shopper` becomes a real functional role, `Registered Customer` becomes real, and `/admin/*` stops being reachable by anyone with the URL.

### Key decisions

| Decision | Recommendation | Why |
|---|---|---|
| Auth library | **Auth.js (NextAuth v5)** | Free, self-hosted, first-class Next.js App Router support, no per-MAU billing. Supports credentials (email/password) + OAuth (Google) out of the box. |
| Alternative | Clerk | Faster to ship (hosted UI components, less code), but adds a paid vendor dependency and less control over the `users` schema shape defined in Phase 1. Reasonable if time-to-market matters more than owning the stack. |
| Session storage | DB sessions (Drizzle adapter) over JWT-only | Enables server-side session revocation (needed for admin security) and matches the "every table gets created_at/updated_at" convention already established. |

### Checklist

- [ ] `users` table + Auth.js Drizzle adapter; email/password + Google OAuth.
- [ ] Password reset + email verification flow (needs Phase 3's email provider, can stub with console-logged links until then).
- [ ] Route middleware: gate `/admin/*` by role (`admin`, `catalog_manager`, `merchandiser`, `support_agent` — the exact set `PRODUCT.md`'s *User roles* section already names). Guest/Registered Customer get 403 on any `/admin` route.
- [ ] Storefront: wire the existing header Sign In / Orders / Wishlist entry points (currently dead links) to real auth pages.
- [ ] Migrate `hooks/use-recently-viewed.ts` and recent-searches from localStorage-only to a merge-on-login pattern: keep localStorage for guests, sync to `users`-linked rows once authenticated, merge on next login.
- [ ] Role assignment UI: `/admin/settings/users` already exists as a UI shell — wire it to real role mutations once this phase's schema lands.

**Acceptance criteria:** an unauthenticated request to any `/admin/*` route redirects to login; a logged-in `Registered Customer` cannot reach `/admin`; a logged-in `Admin` can. Recently-viewed items survive a logout/login cycle.

**Est:** 1.5–2 weeks.

---

## Phase 3 — Cart, checkout & payments

**Goal:** the one phase directly tied to revenue — a shopper can actually buy something.

### Key decisions

| Decision | Recommendation | Why |
|---|---|---|
| Payments | **Stripe** (Payment Intents + Stripe Checkout, or embedded Elements for more control over branding) | Best Next.js/Vercel ecosystem fit, mature webhook model for async confirmation, supports the "no hidden fees" pricing principle from `PRODUCT.md` cleanly (tax/shipping as explicit line items). |
| Transactional email | **Resend** | Built by/for the Next.js ecosystem, simple React-Email templates, fits order-confirmation/password-reset needs without a heavyweight ESP. |
| Cart persistence | DB-backed `carts`/`cart_items`, keyed by `user_id` when logged in, by a signed HTTP-only cookie session id for guests, merged on login | Matches the guest-then-registered flow already implied by `PRODUCT.md`'s role model. |

### Checklist

- [ ] `carts` / `cart_items` tables + server actions or `/api/cart` routes (add/remove/update quantity) — guest cart via cookie, merges into user cart on login.
- [ ] Wire the storefront "Add to Cart" button (already UI-complete per `PRODUCT.md`) to real cart mutations.
- [ ] Cart drawer/page: line items, subtotal, the existing free-shipping-over-$50 policy, tax estimate.
- [ ] Checkout flow: address collection (save to `addresses`), shipping method selection, order review, Stripe payment.
- [ ] **Source-aware shipping estimates at checkout** — self-stocked items ship same/next-day from Baruashop's own warehouse; CJ items carry CJ shipping-line estimates (7–20+ days depending on line/warehouse, per the hybrid model already built in admin). The storefront today has zero source-awareness (only the admin does) — checkout needs to surface this per-item or the "one shipping policy" trust promise in `PRODUCT.md`'s *Vision* section is silently broken for CJ items. Decide: split shipment messaging per item, or hold mixed orders to the slower estimate — this is a product decision worth making explicitly, not defaulting into.
- [ ] Order creation on payment success (Stripe webhook, not client-side confirmation — client-side "success" is not a real payment confirmation).
- [ ] Inventory decrement on order, branched by `source`: self-stocked decrements `inventory.available`; CJ items don't touch local inventory (CJ holds the stock) — this branch already exists conceptually in the admin's inventory model, just needs to be triggered by a real order event instead of the mock generator.
- [ ] Order confirmation email (Resend) + order appears in `/orders` (Registered Customer order history, using the same `Order` shape the admin already renders).

**Acceptance criteria:** a real (test-mode) Stripe payment produces a persisted `orders` row, decrements the correct inventory, and sends a confirmation email — end to end, no mocked step.

**Est:** 3–4 weeks — this is the largest phase; checkout correctness (address validation, tax, payment failure/retry states, webhook idempotency) is inherently fiddly.

---

## Phase 4 — CJdropshipping real API integration

**Goal:** replace every mock CJ interaction built this session with the real CJ API. The UI/data model built in the admin (`source`, `cjSyncStatus`, shipping lines, disputes, sourcing requests) was deliberately designed to make this a backend swap, not a UI rewrite.

### Key decisions

| Decision | Recommendation | Why |
|---|---|---|
| Catalog sync | Scheduled sync (Vercel Cron) into a `cj_catalog_items` table, not a live pass-through per request | 50k–100k items can't be fetched from CJ synchronously on every admin page load; a local cache table (replacing today's static `data/cj-catalog.json`) is required regardless of API vendor. |
| Order push / status | CJ API call on push (`POST` at click-time, same UX as today's mock button) + **webhook** for status changes, with a scheduled polling fallback | Webhooks are the efficient path for `cjSyncStatus` transitions; poll as a fallback in case CJ's webhook delivery is unreliable — don't rely on webhooks alone for a production money-adjacent flow. |
| Background jobs | **Vercel Cron** for scheduled sync, **Inngest or Upstash QStash** for the async order-push/webhook-processing queue | Raw Vercel serverless functions have execution time limits unsuitable for bulk 50k+ item syncing or retry-with-backoff logic; a real queue is worth the dependency here. |

### Checklist

- [ ] Real CJ account + API credentials; replace `CJ_INTEGRATION_SETTINGS` mock with a real encrypted-at-rest credential store (never render the full API key, keep today's masked-display pattern).
- [ ] `cj_catalog_items` table + scheduled sync job; `getCjCatalogTotal()`/`searchCjCatalog()` (`lib/admin/cj-catalog.ts`) swap their `fs.readFileSync` for a DB query — same function signatures, same API route contract (`/api/admin/cj-catalog`), zero UI changes.
- [ ] Real "Push to CJ" — `components/admin/orders/order-detail-panel.tsx` / `cj-orders-table.tsx`'s `onPushToCj` calls a real API route that calls CJ instead of mutating local state.
- [ ] CJ order-status webhook route (`/api/webhooks/cj`) → updates `cjSyncStatus`/`cjTrackingNumber` in the DB in real time, replacing the generator's time-staged mock logic.
- [ ] Real wallet balance fetch on `/admin/cj/settings` (currently the static `$18,420.50` mock).
- [ ] Real after-sales dispute submission — `/admin/cj/after-sales`'s resolve/reject actions call the CJ claims API instead of a local status mutation.
- [ ] Real sourcing-request submission — `/admin/cj/sourcing`'s form posts to CJ instead of appending to local state.
- [ ] **New failure-mode handling not present in the mock**: CJ API rate limits (backoff/retry), sync failures (a genuinely new alert type — distinct from the "stock/price drift on already-imported items" and "sourcing request" alert types already modeled), and CJ account disconnection — the current UI has no error states for any of this because the mock can't fail.

**Acceptance criteria:** every CJ-facing admin action (`push to CJ`, `resolve dispute`, `submit sourcing request`, `browse catalog`) round-trips through the real CJ API with no UI changes required beyond error/loading states; the 50k-item catalog page still paginates responsively.

**Est:** 3–4 weeks, contingent on CJ API documentation quality and rate limits — treat this estimate as the least certain in the plan.

---

## Phase 5 — Admin backend wiring & role gating

**Goal:** every remaining admin mutation (not already covered by Phase 4's CJ work) becomes a real, persisted write, and the console is properly role-gated per Phase 2.

### Checklist

- [ ] Convert every remaining `useState`-only admin table mutation (mark shipped, cancel order, refund, resolve generic dispute, edit product, adjust inventory, category/collection CRUD, marketing campaign CRUD) to real API routes + DB writes.
- [ ] Wire `/admin/categories` and `/admin/collections` CRUD to the DB, finally retiring "an engineer editing `scripts/*-source.mjs`" as the only way to change taxonomy (per `PRODUCT.md`'s Catalog Manager role description).
- [ ] Homepage rail configuration (Deals/Flash Sale/Trending/etc. contents, currently hardcoded selector logic in `lib/products.ts`) becomes admin-editable, fulfilling the Merchandiser role.
- [ ] Real activity/audit log (`app/data/admin/activity.ts` is currently generated) — persist real admin actions for the dashboard's activity feed.
- [ ] Apply Phase 2's role gating per-module (e.g. Support Agent can act on orders/disputes but not edit products; Catalog Manager can't touch payments).

**Acceptance criteria:** a full admin session (create a collection, edit a product, resolve a dispute, mark an order shipped) survives a server restart / page reload with all changes intact.

**Est:** 2–3 weeks (breadth over depth — many modules, each individually simple once the Phase 1 query layer exists).

---

## Phase 6 — Search & personalization upgrade

Per `PRODUCT.md` Phase 4, unchanged by this plan except for sequencing: this needs real order/browsing history (Phases 2–3) to be worth building.

- [ ] Dedicated search index (Meilisearch, Typesense, or Algolia) behind the existing search bar UI; `searchCategories()`/`searchProducts()` string matching becomes the fallback.
- [ ] Replace the static `getRecommendedProducts()` heuristic with real behavioral recommendations once order history exists.

**Est:** 2–3 weeks.

## Phase 7 — Trust & scale

Per `PRODUCT.md` Phase 5:

- [ ] Customer reviews/UGC (schema already sketched in Phase 1).
- [ ] Returns workflow for self-stocked items (distinct from the CJ after-sales claim flow already built).
- [ ] Real fulfillment/shipping carrier integration (rate shopping, label generation) for self-stocked orders.
- [ ] Analytics & A/B testing infrastructure.

**Est:** 4+ weeks, lowest priority of the phases above.

## Phase 8 — AI layer

Per `PRODUCT.md`'s *Future AI roadmap* — unchanged, still deliberately sequenced last since it depends on real behavioral data from Phases 2–3 to be more than a novelty. Not detailed further here; revisit once Phase 3 has shipped and has real usage data.

---

## Cross-cutting work (not a phase — needed throughout)

These aren't sequenced as their own phase because they should start in Phase 1 and continue, not be deferred:

- [ ] **Test suite.** The repo currently has none (`CLAUDE.md`: "There is no test suite/runner configured"). Recommend **Vitest** for unit/integration tests on `lib/*` query helpers and API routes, **Playwright** for E2E on the checkout and admin-mutation flows specifically — those are the two places a silent regression costs real money or real data integrity. Start this in Phase 1 (test the new query layer against the old static-data behavior) rather than bolting it on later.
- [ ] **CI.** GitHub Actions: typecheck + lint + test on every PR at minimum, matching the commands already defined in `CLAUDE.md`.
- [ ] **Environment/secrets management.** `DATABASE_URL`, Stripe keys, Auth.js secrets, CJ API credentials, Resend key — Vercel env vars per environment (dev/preview/prod), never committed. `data/cj-catalog.json`'s successor credentials in particular need to stay out of client bundles, continuing the existing server-only discipline documented in `CLAUDE.md`.
- [ ] **Observability.** Error tracking (Sentry) starting Phase 3 (payments) is close to non-negotiable — a failed webhook or a checkout error with no visibility is a silent revenue leak.
- [ ] **Deployment.** `PRODUCT.md` already names Vercel as the target; formalize preview-deploy-per-PR (pairs naturally with PlanetScale's DB branching) starting Phase 1.

---

## Suggested immediate next steps

The first concrete, startable tickets (before committing to the full Phase 1 sprint):

1. Stand up the PlanetScale MySQL database and get `DATABASE_URL` into local `.env.local` + Vercel env vars (unblocks everything else).
2. Draft the Drizzle schema for `categories`/`brands`/`products`/`product_meta` only (the smallest slice that lets `lib/category-utils.ts` and `lib/products.ts` be rewritten and verified against current storefront behavior) before taking on the full 15+ table schema in one pass.
3. Pick and record the auth library decision (Auth.js vs. Clerk) — this affects the `users` table shape drafted in step 2's schema pass, so it should be decided before, not after, Phase 1 schema work is finalized.

## Open decisions requiring product/business input (not engineering calls)

| Decision | Why it can't be made in code |
|---|---|
| Self vs. CJ catalog mix going forward | Currently a mock 65/35 split (`CJ_SHARE` in `scripts/generate-admin-data.mjs`) with no real merchandising rationale behind it — which categories/bestsellers stay self-stocked vs. CJ-only drives margin and shipping-time consistency. |
| Mixed-order shipping messaging | Flagged in Phase 3 above — split-shipment UI vs. holding to the slower estimate is a customer-trust tradeoff, not a technical one. |
| CJ after-sales SLA | Whether dispute resolution stays a manual ops workflow (as today) or becomes a customer-facing automated flow once Phase 4 wires real CJ claim submission. |
| Auth vendor cost tradeoff | Auth.js (free, more engineering time) vs. Clerk (paid, faster) — a budget/timeline call, not purely technical. |
