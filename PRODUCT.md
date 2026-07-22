# PRODUCT.md

This document defines **Baruashop** as a product: who it's for, what it solves, how it's built, and where it's going. `CLAUDE.md` is the day-to-day engineering reference; this file is the north star those engineering decisions should trace back to.

**Current status:** hybrid — the storefront's catalog, taxonomy, navigation, search, and merchandising surfaces are still implemented against generated static data. Everything else is real and backed by MySQL (see *Tech stack* and `CLAUDE.md`): accounts, cart, checkout, reviews, and now the entire admin console (`/admin`) — including the hybrid self-stocked + CJdropshipping sourcing model — reads and writes real data, gated behind real staff authentication. The one piece of the hybrid sourcing model still mocked is the live CJdropshipping API connection itself (pushing an order to CJ writes a real local record but doesn't call a real CJ API). Two things gate the commerce flow going fully live: `STRIPE_SECRET_KEY`/`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `SENDGRID_API_KEY` are unset in `.env.local` — until they're filled in, checkout stops with a clear "not configured" message instead of charging a card, and confirmation emails log to the server console instead of sending.

---

## Vision

Most large-catalog shopping online happens in one of two modes: a third-party **marketplace** (eBay, Amazon Marketplace) where selection is enormous but seller quality, shipping, and return policy vary listing to listing — or a **single-brand store** that's curated but shallow, covering one or two categories at most.

Baruashop is the middle: **a single vendor, one quality bar, one shipping and returns policy — with marketplace-scale selection and marketplace-grade browsing.** Every item is sold and fulfilled by Baruashop directly. The bet is that shoppers will trade a bit of marketplace-style bottom-dollar pricing for consistent trust, and that a deep, well-organized taxonomy (not just a search box) is still how a lot of people actually like to shop.

## Target customers

- **The category browser** — doesn't always arrive with a search term in mind; wants to enter "Electronics" and actually enjoy narrowing down through TVs → Smart TVs. This is the primary reason the category tree and mega menu get as much product investment as search does.
- **The deal-driven shopper** — checks Today's Deals / Flash Sale first, is price- and discount-sensitive, cart-abandons without visible savings signals.
- **The mobile-first shopper** — majority of browsing sessions; needs the full taxonomy and filtering to work as well in a drawer as it does in a desktop mega menu.
- **The repeat/replenishment shopper** — buys household/consumable categories (grocery, health & beauty, pet supplies) on a cadence; values Recently Viewed and Recommended surfaces that shortcut re-purchase.
- **The trust-sensitive buyer** — has been burned by inconsistent marketplace sellers before; is the primary audience for the "single vendor" positioning and needs to see that reinforced (ratings, warranty copy, consistent shipping policy) throughout, not just on a trust-badge footer link.

## Problems solved

1. **Marketplace inconsistency.** No third-party sellers, no listing-by-listing shipping/return variance — one policy, everywhere, always. This is a hard non-goal boundary, not just a tagline (see *Non-goals*).
2. **Shallow single-vendor taxonomies.** Most single-vendor sites top out at 2 levels of navigation and dump everything else into a flat "filter by tag" grid. Baruashop's taxonomy is 3 levels deep and data-driven (1,652 category nodes) specifically so that mega menu, sidebar, breadcrumb, and category pages can all stay in sync automatically as the catalog grows.
3. **Search that doesn't know about categories.** Autocomplete surfaces category matches with their breadcrumb path, not just a flat product-name guess — so "shoes" resolves toward *Shoes / Athletic Shoes* or *Sporting Goods & Outdoors / Golf* rather than a wall of unrelated SKUs.
4. **Generic, static homepages.** The homepage is a set of independently queryable merchandising rails (Deals, Flash Sale, Trending, New Arrivals, Best Sellers, Recently Viewed, Recommended) rather than one hard-coded layout — the intent is that these become independently mutable/personalizable surfaces (see *Future AI Roadmap*), not a single static hero page.

## Non-goals

- **Not a marketplace.** No third-party sellers, no seller ratings separate from Baruashop's own, no "sold by X, fulfilled by Y" ambiguity.
- **Not a marketplace UI clone.** Deliberately original visual identity and interaction design — inspired by the browsing patterns of large US ecommerce sites, not their branding.
- **Not (yet) a B2B/wholesale channel.** Pricing, roles, and catalog are consumer-single-unit oriented.

## Core modules

| Module | Status | Description |
|---|---|---|
| Taxonomy engine | **Live** | Data-driven 3-level category tree (top → child → grandchild), generated from `scripts/category-source.mjs`. Every nav surface (mega menu, mobile drawer, sidebar tree, breadcrumb, category pages) reads from the same `CATEGORIES` source of truth. |
| Product catalog | **Live** | Generated product set (`app/data/products.ts`), one leaf category always resolvable to real, filterable/sortable products via `lib/products.ts`. |
| Discovery & navigation | **Live** | Desktop mega menu (hover + click), mobile accordion drawer with in-drawer category search, recursive expandable sidebar tree. |
| Search | **Live** | Category-scoped search bar, autocomplete against the taxonomy, recent/popular searches (localStorage), dedicated `/search` results page over the product catalog. |
| Merchandising rails | **Live** | Today's Deals, Flash Sale (live countdown), Trending, New Arrivals, Best Sellers, Recently Viewed, Recommended — each an independent, swappable `ProductRail`. |
| Product detail & conversion | **Live** | Gallery, pricing/discount display, stock/warranty/shipping trust block, related products, and a real customer reviews section (star rating, title, body — one review per signed-in customer per product). "Add to Cart" is wired to the real persistent cart. |
| Brand directory | **Live** | Cross-category brand registry (`app/data/brands.ts`) surfaced as "Popular Brands" in the mega menu, category pages, and product filters. |
| Accounts | **Live** | Email/password sign-up and sign-in (`auth.ts`, NextAuth credentials + JWT sessions, bcrypt-hashed passwords in MySQL), route-protected `/account` (overview, order history, address book) via `middleware.ts`, session-aware header. Wishlist is still a local-only UI stub (see `CLAUDE.md`). |
| Cart & checkout | **Live** | Server-side cart (`lib/cart.ts`) — guest carts keyed by an httpOnly cookie, merged into the user's cart on login; persists across devices once signed in. Checkout collects a shipping address, creates a Stripe PaymentIntent for the server-computed total, and confirms via Stripe's Payment Element. Order creation is idempotent and fires from both the Stripe webhook and a success-page fallback (see `CLAUDE.md`), decoupled from trusting the client redirect alone. |
| Admin console | **Live** | Full back-office at `/admin`: Dashboard, Products, Orders, Inventory, Categories, Collections, Customers, Reviews, Marketing, Supplier, Payments, Analytics, Shipping, Content, Settings — polished data tables, slide-over detail panels, KPIs, all reading real MySQL. Gated by real staff authentication (`admin_users` table, `/admin/login`, enforced in `middleware.ts`) — see *User roles*. Every screen now has real create/edit/delete, not just real reads: order fulfillment/refund/CJ-push, review moderation, CJ dispute resolution, product edits/delete, inventory correction, API key management, collections, content, marketing campaigns, shipping rates/carriers, and staff invites (with a one-time generated temporary password) all write for real and log to a real audit trail. |
| Supplier sourcing (CJdropshipping hybrid) | **Live (UI + data real; CJ API mocked)** | Products are either self-stocked (wholesale-restocked into Baruashop's own warehouses) or dropshipped via CJdropshipping — modeled per-product via a `source: "self" \| "cj"` field. Its own dedicated admin nav module at `/admin/cj` (Overview, Catalog, Orders, After-Sales, Sourcing Requests, Settings) covers the full workflow: a 50,000-item generated CJ catalog server-side paginated/searchable with bulk import (`/admin/cj/catalog`); a fulfillment queue with a bulk "Push to CJ" action that writes a real order update (`/admin/cj/orders`); CJ claims for lost/damaged/wrong-item/defective items, with real resolve/reject mutations (`/admin/cj/after-sales`); requests to source products not yet in CJ's catalog (`/admin/cj/sourcing`); and the (mock) CJ account connection, wallet balance, and shipping-line defaults (`/admin/cj/settings`). No real CJ API/webhook connection exists yet — see `CLAUDE.md` for the data-loading architecture. |

## User roles

Customer-facing roles are live; staff sign-in is live and role-gated at the "can reach `/admin` at all" level, but per-role permission boundaries within the console aren't enforced yet (any active staff account can reach every screen):

- **Guest Shopper** *(current)* — browses, searches, filters, and can hold items in a cart (cookie-based, merged into their account if they sign in before checkout); recently-viewed is local to the device. Checkout itself requires an account (see *Cart & checkout*).
- **Registered Customer** *(current)* — email/password account, persistent cart, real order history, saved addresses, and can leave product reviews. Wishlist is not yet synced server-side — still local to the device (see *Core modules*).
- **Owner** *(current)* — the `admin_users.role` seeded for full back-office access; functionally identical to every other staff role today since permission checks aren't enforced yet.
- **Admin** *(current, unenforced)* — role/permission management, site-wide configuration. Stored on `admin_users.role`; not yet distinguished in practice from Owner.
- **Merchandiser** *(current, unenforced)* — configures homepage rail contents, Flash Sale windows, featured collections; owns *what shoppers see*, not the catalog data itself. Stored on `admin_users.role`; the collections/content screens this role would use are themselves still read-only (see *Core modules*).
- **Catalog Manager** *(current, unenforced)* — owns product and category data: pricing, inventory, taxonomy placement. Product pricing/inventory edits are real; category/taxonomy placement is still "an engineer editing `scripts/*-source.mjs`."
- **Support Agent** *(current, unenforced)* — order lookup, return/refund processing. The order/refund/dispute actions this role would use are real and already wired.

There is deliberately no "Seller" role — see *Non-goals*.

## Pricing strategy

Product pricing follows a **premium-accessible** positioning: competitive base pricing, and every discount shown is a genuine reduction off a real prior price — never an inflated "original price" invented purely to manufacture a percentage-off badge.

Mechanics currently implemented in the data layer (`scripts/generate-products.mjs`, `lib/format.ts`):

- **Base price** — every product has a single `price`.
- **Discounts** — a product may carry an `originalPrice`; `discountPercent()` derives the badge shown. Roughly a third of the catalog carries a discount at any time, split across two mutually-reinforcing signals:
  - `isDeal` — everyday markdown, shown with an orange **Deal** badge.
  - `isFlashSale` — time-boxed markdown, shown with a red **Flash Sale** badge and a countdown; takes visual priority over the Deal badge when both are true.
- **Free shipping** operates at two levels, intentionally: a per-item `freeShipping` flag (shown on the product card/detail page — currently true for all items ≥ $25, plus a random subset of cheaper items), *and* a blanket order-level policy advertised in the top bar ("Free shipping on orders over $50") — the real checkout (`lib/checkout.ts`) implements this order-level threshold: a flat $6.99 below it, free at or above it.
- **No hidden fees** as a stated principle — whatever is shown as `price` is the transaction price; tax/shipping are additive and disclosed, never baked in silently. Checkout applies a flat 8.25% tax rate on subtotal + shipping — a placeholder for real destination-based tax calculation, not a final rate.

Roadmap: promo codes, tiered/loyalty pricing, and bundle pricing remain out of scope now that the cart/checkout module exists — no reason to add pricing-engine complexity ahead of real usage.

## Tech stack

- **Framework:** Next.js 15 (App Router, Turbopack, Server Components by default)
- **UI runtime:** React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (CSS-first config via `app/globals.css`, no `tailwind.config.ts`)
- **Component primitives:** shadcn/ui on the `base-nova` style — i.e. built on **Base UI** (`@base-ui/react`), not Radix. Composition uses the `render` prop, not `asChild` (see `CLAUDE.md`).
- **Icons:** lucide-react
- **Motion:** Framer Motion (mega menu panels, hero carousel, accordion trees)
- **Data layer:** split. Catalog/taxonomy/brands (and all `/admin` data) are still generated static TypeScript modules — see *Database Conventions*. Accounts, carts, orders, addresses, and reviews are real, backed by **MySQL** via **Drizzle ORM** (`db/schema.ts`) — see `CLAUDE.md` for the local dev setup.
- **Auth:** Auth.js (NextAuth v5) — credentials provider (bcrypt-hashed passwords), JWT sessions, `middleware.ts` route-protects `/account/*`.
- **Payments:** Stripe (Payment Intents + Payment Element); order creation is driven by a Stripe webhook with an idempotent success-page fallback for local dev.
- **Email:** SendGrid for order-confirmation email; falls back to a console log when `SENDGRID_API_KEY` is unset so local dev doesn't require a SendGrid account.
- **Images:** picsum.photos placeholders, seeded deterministically per slug (`next.config.ts` `remotePatterns`)
- **Target deployment:** Vercel (implied by the Next.js/Turbopack toolchain); not yet deployed

## Folder architecture

```
app/
  data/                  generated: categories.ts, brands.ts, products.ts (do not hand-edit)
  data/admin/            generated: one-time seed source for scripts/seed-db.ts only — the admin console itself reads MySQL, not these files
  api/products/          GET ?ids=… — fetches product objects by id for client components
  api/admin/cj-catalog/  GET — paginated/searchable read over the 50k-item CJ catalog (data/cj-catalog.json)
  category/[...slug]/    category landing pages, all 3 taxonomy depths via one catch-all route
  product/[slug]/        product detail page (now includes real customer reviews)
  search/                search results page
  account/                sign-in, sign-up, account overview, order history, address book (route-protected by middleware.ts)
  cart/                   cart page
  checkout/               checkout (address + Stripe Payment Element) and /checkout/success
  admin/                 the back-office console (dashboard, products, orders, inventory, supplier/CJ, settings, etc.) — reads/writes real MySQL, gated by real staff auth (admin/login + middleware.ts)
  api/auth/[...nextauth]/ Auth.js route handler
  api/webhooks/stripe/    Stripe webhook — authoritative real-order creation on payment_intent.succeeded
  page.tsx               homepage
  layout.tsx             root layout: Header + Footer shell, metadata

components/
  layout/                header, top bar, mega menu, mobile nav, footer
  search/                search bar (autocomplete, recent/popular searches)
  category/              breadcrumb, tree sidebar, category page sections (hero, subcategory grid, brands row, featured collections)
  product/               product card, rails, filter/sort/grid explorer, gallery, badges, ratings, price display, reviews section
  home/                  homepage-only sections (hero banner, flash sale, newsletter, recently viewed)
  account/               sign-in/sign-up forms, account tabs, address book
  cart/                  CartProvider (client context), cart badge, cart view
  checkout/              checkout address form, Stripe payment step
  admin/                 back-office components (data tables, slide-over panels, CJ catalog/disputes UI, etc.)
  ui/                    shadcn primitives (generated via `npx shadcn add`)

lib/
  category-utils.ts      category tree traversal/lookup (resolveCategoryPath, buildCategoryTree, searchCategories, categoryHref)
  products.ts             product query/filter/sort/derive helpers (static catalog)
  types.ts                Product, Brand, and related shared types
  format.ts                price/number formatting
  utils.ts                 cn() and other generic helpers
  cart.ts, checkout.ts, checkout-actions.ts, orders.ts, address-actions.ts, review-actions.ts, reviews-data.ts, auth-actions.ts, personalization.ts, stripe.ts, sendgrid.ts, email-templates.ts, money.ts, id.ts — the real commerce layer, backed by MySQL
  admin/                  admin data access + types, including the server-only CJ catalog loader (see CLAUDE.md) — still generated mock data

db/                      schema.ts (Drizzle schema: users, addresses, carts, cart_items, orders, order_items, reviews) + index.ts (pooled client)
auth.ts, auth.config.ts  Auth.js config, split edge-safe/full per CLAUDE.md's middleware gotcha
middleware.ts            route-protects /account/*

hooks/                   localStorage-backed client hooks (recently viewed, recent searches)
scripts/                 data generators + their *-source.mjs input files (see CLAUDE.md)
data/                    data/cj-catalog.json — 50k-item generated CJ catalog, read server-only (never imported)
```

Convention: **data flows one direction** — `scripts/*-source.mjs` → generator → `app/data/*.ts` → `lib/*.ts` query helpers → components. Components never reach into `app/data` and re-derive logic that belongs in `lib/`. This still governs catalog/taxonomy/admin data; the real commerce layer (accounts, cart, orders, reviews) instead flows `db/schema.ts` → `lib/*.ts` query/action functions (Drizzle) → components — the same "components never touch the raw source directly" discipline, just with MySQL instead of a generated file as the source.

## Development roadmap

Phase numbering here matches the client-facing proposal (`Baruashop-Proposed-Feature-List.pdf`) — five phases, grouped by feature area rather than by technical layer. `FEATURES.md` is the engineering-detail expansion of the same five phases.

- **Phase 1 — Storefront & Shopping Experience** *(done)*: taxonomy engine, catalog, mega menu/search/sidebar navigation, category and product pages, homepage merchandising rails, real customer reviews (rating, title, body; one per customer per product, backed by MySQL, auto-approved — no moderation queue routing to the admin Reviews screen yet), and a first personalization pass (`lib/personalization.ts` ranks "Recommended For You" by a signed-in shopper's real purchase-history categories once they have order history, falling back to the static top-rated heuristic otherwise). Remaining: a dedicated search index (tracked under Phase 5.4) — search is still `searchProducts()`'s substring match.
- **Phase 2 — Accounts, Cart & Checkout** *(done)*: real MySQL-backed accounts (Auth.js, bcrypt, JWT sessions), persistent server-side cart with guest-to-account merge, address book, order history, Stripe-powered checkout (Payment Element, webhook-driven idempotent order creation), and SendGrid order-confirmation email. Both Stripe and SendGrid degrade gracefully to a clear "not configured" state without live keys — see `CLAUDE.md`. Checkout now writes a real `payments` row alongside the order and decrements real `inventory.available` for self-stocked line items (CJ-sourced items don't decrement — CJ holds that stock, not us). Remaining: activating production Stripe/SendGrid credentials (no further development work); the source-aware mixed-order shipping-time messaging decision flagged in `FEATURES.md` is still open.
- **Phase 3 — Operations Console** *(done)*: every admin screen (product/order/inventory/customer/payments/reviews/CJ ops/marketing/content/shipping/team settings) reads live MySQL — the entire generated-mock-data layer (`app/data/admin/*.ts`) has been retired from the admin console. `/admin/*` is gated by real staff authentication (`admin_users` table, bcrypt, a dedicated `/admin/login`, checked in `middleware.ts` before any admin page renders) — customer accounts cannot reach it. Every screen now has real create/edit/delete, not just real reads, and every mutation logs to a real audit trail (`activity_events`): order fulfillment/cancel/refund (refund calls the real Stripe refund API when configured)/push-to-CJ, review approve/reject, CJ dispute resolve/reject, product price/cost/status/visibility edits and delete, manual inventory stock correction, and full CRUD on collections, content, marketing campaigns, shipping rates/carriers, and staff accounts (invite generates and one-time-displays a real bcrypt-hashed temporary password; reset-password, edit role/status, and remove are all real too, with a guard against an admin deleting their own account). Remaining: category/brand taxonomy is still edited through `scripts/*-source.mjs`, not the admin Categories screen; staff `role` (Owner/Admin/Merchandiser/Support/Catalog Manager) is stored and displayed but not yet enforced — any active staff account can reach every admin screen regardless of role.
- **Phase 4 — Hybrid Supplier Sourcing**: *UI built, reads/writes real DB* — the dedicated CJdropshipping module (`/admin/cj`: catalog browse/import, fulfillment queue, after-sales, sourcing requests, settings) runs against a generated 50,000-item catalog snapshot and real `cj_disputes`/`cj_sourcing_requests`/`cj_integration_settings` tables, not a live CJdropshipping API connection — pushing an order to CJ and resolving a dispute both persist for real, but the actual CJ-side API call is mocked (a random CJ order ID, no live status sync back). Remaining: real-time supplier integration, tracked under Phase 5.1.
- **Phase 5 — Advanced Capabilities**: *not started*, except 5.2 which is now done (see Phase 3). Real-time CJdropshipping API integration (5.1), staff roles & permissions enforcement beyond "is staff" (5.3), a dedicated search engine plus deeper personalization and account-synced wishlist (5.4), promo codes/loyalty/bundle pricing (5.5), and returns/live carrier shipping/analytics (5.6). See `FEATURES.md` for the full breakdown.

The AI capabilities described in *Future AI Roadmap* below sit outside this five-phase structure — they're a later-stage initiative, not scoped into Phase 5, and depend on having real usage data from Phases 1–2 before they're more than a novelty.

## Coding standards

- **TypeScript strict mode**, no `any`; shared types live in `lib/types.ts`, not re-declared per component.
- **Server Components by default.** Add `"use client"` only when a component needs interactivity/state/effects — this is why merchandising rails, filters, and menus are client components but product cards, category grids, and page shells are not.
- **Respect the RSC serialization boundary**: never pass a function (icon component, callback that isn't a client-defined handler) from a Server Component into a Client Component's props. See `CLAUDE.md` for the concrete pattern.
- **Generated data is read-only.** Anything in `app/data/*.ts` is regenerated from `scripts/*-source.mjs`; changes belong in the source file, not the output.
- **No duplicated query/filter logic.** Product/category filtering, sorting, and lookup belong in `lib/products.ts` / `lib/category-utils.ts`, not reimplemented inline per component.
- **Naming:** kebab-case file names, PascalCase component names, camelCase functions/variables, one component per file.
- **Imports:** always via the `@/*` path alias, never deep relative paths (`../../../`).
- **Styling:** Tailwind utility classes co-located with markup; no separate CSS-module or styled-components layer. Shared class logic goes through `cn()` (`lib/utils.ts`).

## Design system

- **Base:** shadcn/ui `base-nova` style, `neutral` base color, CSS-variable-driven theme (supports light/dark).
- **Typography:** Geist Sans (UI text) / Geist Mono (numeric/tabular contexts), loaded via `next/font`.
- **Color usage is semantic, not decorative:**
  - `primary` — brand actions (CTAs, active nav state, links).
  - Flash Sale — red (`bg-red-600`)
  - Deal — orange (`bg-orange-500`)
  - New Arrival — sky blue (`bg-sky-600`)
  - Best Seller — amber (`bg-amber-500`)
  - Discount percentage text — emerald green
  - Out of stock — muted/neutral, never a "loud" color
- **Iconography:** lucide-react exclusively; every top-level category carries exactly one representative icon (`app/data/categories.ts`), reused consistently across mega menu, sidebar, and category grid.
- **Imagery aspect ratios:** 1:1 for product cards/gallery thumbnails, 4:3 for category tiles, wide banner (≈16:7) for hero and category-hero banners — kept consistent so grids never jitter row heights.
- **Motion:** Framer Motion for anything spatial (mega menu open/close, accordion expand/collapse, hero slide transitions); durations stay short (150–500ms) and easing-out, motion communicates state change, it doesn't decorate.
- **Density:** product grids default to 2 columns (mobile) up to 4–6 columns (desktop); rails scroll horizontally rather than wrapping, to keep merchandising sections scannable in one glance.

## Database conventions

**Partially implemented.** MySQL (via Drizzle ORM, `db/schema.ts`) is real for the commerce entities — `users`, `addresses`, `carts`/`cart_items`, `orders`/`order_items`, `reviews` — see `CLAUDE.md` for local setup. Catalog/taxonomy (`categories`, `products`, `brands`) and everything under `/admin` are **not** migrated yet and still come from `app/data/*.ts`; the conventions below apply as-built to the commerce tables and remain the target for the catalog tables when that migration happens.

- **Tables:** plural, snake_case (`users`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`, `reviews` — implemented; `categories`, `products`, `brands` — not yet).
- **Primary keys:** ULID `id` (`lib/id.ts`), as built. Catalog tables, when migrated, keep the human-readable `slug` unique-indexed alongside `id`, since `slug` is what URLs/route params use.
- **Category tree:** unchanged from the original plan (self-referencing `parent_id` + `level` enum, or three explicit tables) — not yet built, still generated.
- **Product–category relation:** unchanged from the original plan — not yet built. Orders instead **snapshot** `productId`/`title`/`image`/`price`/`source` onto each `order_item` at checkout time (not a live FK to the product), so a later catalog price change never rewrites historical order totals.
- **Money:** integer minor units (cents) in every commerce table (`*_cents` columns), as built — `lib/money.ts`'s `toCents`/`toDollars` is the single conversion boundary at the DB query layer; components still work in dollar floats via the existing `Product.price` shape, matching `formatPrice()`/`formatMoney()`.
- **Timestamps:** `created_at` / `updated_at` on every table, as built (`onUpdateNow()` for updates).
- **Deletes:** hard-delete only exists today for cart items (removing a line item) and addresses. Orders and reviews are never deleted through the app. Soft-delete for products applies once the catalog itself is migrated — not yet relevant.
- **Migrations:** `drizzle-kit push` against `drizzle.config.ts` today (fast local iteration); a real versioned migration history (`drizzle-kit generate` + committed SQL files) is the intended move before this goes to a shared/production database.

## API conventions

`GET /api/products?ids=a,b,c` (`app/api/products/route.ts`), returning `{ products: Product[] }`, is still the model for catalog-data reads. Mutations now mostly go through **Server Actions** instead (`lib/cart.ts`, `lib/checkout-actions.ts`, `lib/address-actions.ts`, `lib/review-actions.ts`, `lib/auth-actions.ts` — all `"use server"`), called directly from Client Components without a route handler; the two real exceptions are `app/api/auth/[...nextauth]/route.ts` (Auth.js requires a route) and `app/api/webhooks/stripe/route.ts` (a third party posting to us, not something a Server Action can receive). Conventions below still generalize the pattern for the routes that do exist:

- **Route handlers** under `app/api/*`, REST-shaped (`GET` for reads, `POST`/`PATCH`/`DELETE` for mutations once they exist) — used when a route handler is actually required (webhooks, auth, or the client-component-can't-cross-the-RSC-boundary case below), not as the default mutation path.
- **Response envelope:** `{ <resourceName>: T | T[] }` for success (matches the existing `{ products }` shape) — errors as `{ error: { message, code } }`, not a bare string or thrown HTML error page.
- **Reads are public and cache-friendly** where the data is catalog data (products, categories, brands); **mutations require auth**, as implemented — every Server Action that touches cart/order/address/review data checks `auth()` itself rather than trusting the caller.
- **List endpoints paginate.** Given the catalog is already 2,832+ products, any future "list products" endpoint should be cursor-based from day one, not offset-based.
- **Validate input** (e.g. with `zod`) at the route boundary before it reaches `lib/` query helpers — `lib/products.ts`/`lib/category-utils.ts` should be able to assume well-formed input.
- **Keep the API and the direct-import path consistent.** Server Components should keep importing `lib/products.ts` / `lib/category-utils.ts` directly (no network hop); the API routes exist specifically for the client-component case where data can't cross the RSC boundary directly (see `CLAUDE.md`).

## Future AI roadmap

Sequenced after Phase 2 (accounts, cart & checkout — the real backend) since most of this needs real behavioral/order data to be more than a novelty:

- **Conversational category navigation** — a shopping assistant that can traverse the 1,416-leaf taxonomy conversationally ("something for a rainy camping trip") and land the user on the right grandchild category or filtered product set, rather than requiring them to know the taxonomy path.
- **Semantic/natural-language search** — layer a real embeddings-based search behind the existing search bar UI, so query intent (not just substring match) drives results; the current `searchCategories()`/`searchProducts()` string matching becomes the fallback, not the primary path.
- **Personalized merchandising** — extend beyond the purchase-history-based "Recommended For You" ranking already live (`lib/personalization.ts`) to the rest of the still-static, same-for-everyone rails (`getDealsProducts()`, `getTrendingProducts()`, etc.), and factor in browsing behavior alongside purchase history; the `ProductRail` component contract is already generic enough to accept any product list, so this remains a data-source swap, not a UI rewrite.
- **AI-assisted catalog operations** — auto-suggest the correct leaf category and generated marketing copy for new SKUs at import time, replacing/augmenting the current hand-authored `scripts/*-source.mjs` descriptions.
- **Visual search** — "find products like this photo," made feasible by every product already carrying a consistent square product image.
- **Anomaly detection** — fraud/returns-abuse signals once real orders exist (Phase 2+).

## Glossary

- **Top / child / grandchild category** — the three fixed levels of the taxonomy (`Category` → `ChildCategory` → `GrandchildCategory` in `app/data/categories.ts`). A "leaf" category always means a grandchild — the level products are actually attached to.
- **Rail** — a horizontally-scrolling row of products on the homepage (e.g. Today's Deals), implemented once as `ProductRail` and reused per section.
- **Mega menu** — the desktop hover/click navigation panel showing a category's children, grandchildren, banner image, and popular brands in one view.
