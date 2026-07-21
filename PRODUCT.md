# PRODUCT.md

This document defines **Baruashop** as a product: who it's for, what it solves, how it's built, and where it's going. `CLAUDE.md` is the day-to-day engineering reference; this file is the north star those engineering decisions should trace back to.

**Current status:** frontend prototype. The catalog, taxonomy, navigation, search, and merchandising surfaces described below are implemented against generated static data. A full admin console (`/admin`) is also built — including a hybrid self-stocked + CJdropshipping sourcing model against a 50,000-item generated CJ catalog — but like the storefront, it runs against generated mock data, not a real database or a real CJ API connection. Accounts, cart persistence, checkout, payments, and real backend/auth wiring for the admin console are **not yet built** — they're specified here as roadmap so the frontend is built against a coherent target rather than painted into a corner.

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
| Product detail & conversion | **Live (UI only)** | Gallery, pricing/discount display, stock/warranty/shipping trust block, related products. "Add to Cart" is UI-complete but not wired to persistent cart state yet. |
| Brand directory | **Live** | Cross-category brand registry (`app/data/brands.ts`) surfaced as "Popular Brands" in the mega menu, category pages, and product filters. |
| Accounts | **Planned** | Header already exposes Sign In / Orders / Wishlist entry points; no auth or persistence behind them yet. |
| Cart & checkout | **Planned** | No cart persistence, no payment integration. |
| Admin console | **Live (UI only)** | Full back-office at `/admin`: Dashboard, Products, Orders, Inventory, Categories, Collections, Customers, Reviews, Marketing, Supplier, Payments, Analytics, Shipping, Content, Settings — polished data tables, slide-over detail panels, KPIs. Runs against generated mock data (`scripts/generate-admin-data.mjs`), not a real database; no auth/role gating yet (see *User roles*). |
| Supplier sourcing (CJdropshipping hybrid) | **Live (UI only)** | Products are either self-stocked (wholesale-restocked into Baruashop's own warehouses) or dropshipped via CJdropshipping — modeled per-product via a `source: "self" \| "cj"` field. Its own dedicated admin nav module at `/admin/cj` (Overview, Catalog, Orders, After-Sales, Sourcing Requests, Settings) covers the full workflow: a 50,000-item generated CJ catalog server-side paginated/searchable with bulk import (`/admin/cj/catalog`); a fulfillment queue with a bulk "Push to CJ" action (`/admin/cj/orders`); CJ claims for lost/damaged/wrong-item/defective items (`/admin/cj/after-sales`); requests to source products not yet in CJ's catalog (`/admin/cj/sourcing`); and the (mock) CJ account connection, wallet balance, and shipping-line defaults (`/admin/cj/settings`). No real CJ API/webhook connection exists yet — see `CLAUDE.md` for the data-loading architecture. |

## User roles

Only one role exists functionally today (**Guest Shopper** — no login required for any current feature). The rest are designed-for, to keep the data model and route structure from having to be reshaped later:

- **Guest Shopper** *(current)* — browses, searches, filters; wishlist/recently-viewed are local to the device.
- **Registered Customer** *(planned)* — persistent cart, order history, saved addresses, wishlist synced across devices.
- **Merchandiser** *(planned)* — configures homepage rail contents, Flash Sale windows, featured collections; owns *what shoppers see*, not the catalog data itself.
- **Catalog Manager** *(planned)* — owns product and category data: pricing, inventory, taxonomy placement. Today this role is effectively "an engineer editing `scripts/*-source.mjs`."
- **Support Agent** *(planned)* — order lookup, return/refund processing.
- **Admin** *(planned)* — role/permission management, site-wide configuration.

There is deliberately no "Seller" role — see *Non-goals*.

## Pricing strategy

Product pricing follows a **premium-accessible** positioning: competitive base pricing, and every discount shown is a genuine reduction off a real prior price — never an inflated "original price" invented purely to manufacture a percentage-off badge.

Mechanics currently implemented in the data layer (`scripts/generate-products.mjs`, `lib/format.ts`):

- **Base price** — every product has a single `price`.
- **Discounts** — a product may carry an `originalPrice`; `discountPercent()` derives the badge shown. Roughly a third of the catalog carries a discount at any time, split across two mutually-reinforcing signals:
  - `isDeal` — everyday markdown, shown with an orange **Deal** badge.
  - `isFlashSale` — time-boxed markdown, shown with a red **Flash Sale** badge and a countdown; takes visual priority over the Deal badge when both are true.
- **Free shipping** operates at two levels, intentionally: a per-item `freeShipping` flag (shown on the product card/detail page — currently true for all items ≥ $25, plus a random subset of cheaper items), *and* a blanket order-level policy advertised in the top bar ("Free shipping on orders over $50") that will apply to the eventual cart regardless of individual item flags.
- **No hidden fees** as a stated principle — whatever is shown as `price` is the transaction price; tax/shipping are additive and disclosed, never baked in silently.

Roadmap: promo codes, tiered/loyalty pricing, and bundle pricing are explicitly out of scope until the cart/checkout module exists.

## Tech stack

- **Framework:** Next.js 15 (App Router, Turbopack, Server Components by default)
- **UI runtime:** React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (CSS-first config via `app/globals.css`, no `tailwind.config.ts`)
- **Component primitives:** shadcn/ui on the `base-nova` style — i.e. built on **Base UI** (`@base-ui/react`), not Radix. Composition uses the `render` prop, not `asChild` (see `CLAUDE.md`).
- **Icons:** lucide-react
- **Motion:** Framer Motion (mega menu panels, hero carousel, accordion trees)
- **Data layer:** generated static TypeScript modules (no database yet — see *Database Conventions* for the intended migration path)
- **Images:** picsum.photos placeholders, seeded deterministically per slug (`next.config.ts` `remotePatterns`)
- **Target deployment:** Vercel (implied by the Next.js/Turbopack toolchain); not yet deployed

## Folder architecture

```
app/
  data/                  generated: categories.ts, brands.ts, products.ts (do not hand-edit)
  data/admin/            generated: admin mock data (orders, inventory, disputes, etc. — do not hand-edit)
  api/products/          GET ?ids=… — fetches product objects by id for client components
  api/admin/cj-catalog/  GET — paginated/searchable read over the 50k-item CJ catalog (data/cj-catalog.json)
  category/[...slug]/    category landing pages, all 3 taxonomy depths via one catch-all route
  product/[slug]/        product detail page
  search/                search results page
  admin/                 the back-office console (dashboard, products, orders, inventory, supplier/CJ, settings, etc.)
  page.tsx               homepage
  layout.tsx             root layout: Header + Footer shell, metadata

components/
  layout/                header, top bar, mega menu, mobile nav, footer
  search/                search bar (autocomplete, recent/popular searches)
  category/              breadcrumb, tree sidebar, category page sections (hero, subcategory grid, brands row, featured collections)
  product/               product card, rails, filter/sort/grid explorer, gallery, badges, ratings, price display
  home/                  homepage-only sections (hero banner, flash sale, newsletter, recently viewed)
  admin/                 back-office components (data tables, slide-over panels, CJ catalog/disputes UI, etc.)
  ui/                    shadcn primitives (generated via `npx shadcn add`)

lib/
  category-utils.ts      category tree traversal/lookup (resolveCategoryPath, buildCategoryTree, searchCategories, categoryHref)
  products.ts             product query/filter/sort/derive helpers
  types.ts                Product, Brand, and related shared types
  format.ts                price/number formatting
  utils.ts                 cn() and other generic helpers
  admin/                  admin data access + types, including the server-only CJ catalog loader (see CLAUDE.md)

hooks/                   localStorage-backed client hooks (recently viewed, recent searches)
scripts/                 data generators + their *-source.mjs input files (see CLAUDE.md)
data/                    data/cj-catalog.json — 50k-item generated CJ catalog, read server-only (never imported)
```

Convention: **data flows one direction** — `scripts/*-source.mjs` → generator → `app/data/*.ts` → `lib/*.ts` query helpers → components. Components never reach into `app/data` and re-derive logic that belongs in `lib/`.

## Development roadmap

- **Phase 0 — Storefront foundation** *(current)*: taxonomy engine, catalog, mega menu/search/sidebar navigation, category and product pages, homepage merchandising rails.
- **Phase 1 — Commerce backend**: real database, persistent cart, checkout flow, payment provider integration, inventory decrement on order.
- **Phase 2 — Accounts**: authentication, order history, address book, wishlist/recently-viewed synced server-side instead of localStorage-only.
- **Phase 3 — Admin console**: *UI built* — product/order/inventory/supplier/customer/marketing/content management, including the CJdropshipping hybrid sourcing workflow. Remaining: wire it to a real database and real CJ API instead of generated mock data, add auth/role gating (see *User roles*), and replace the still-manual `scripts/*-source.mjs` editing for category/brand taxonomy and homepage rail configuration.
- **Phase 4 — Search & personalization upgrade**: dedicated search index (e.g. Meilisearch/Typesense/Algolia) behind the existing search UI; replace the static `getRecommendedProducts()` heuristic with real behavioral recommendations.
- **Phase 5 — Trust & scale**: customer reviews/UGC, returns workflow, real fulfillment/shipping integration, analytics and experimentation (A/B testing) infrastructure.
- **Phase 6 — AI layer**: see *Future AI Roadmap* below; deliberately sequenced after a real backend exists, since most of it depends on real user behavior data, not just catalog data.

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

No database exists yet; these conventions exist so that whichever one is introduced (Phase 1) maps cleanly onto the shapes already established by `app/data/*.ts` and `lib/types.ts`, instead of forcing a frontend rewrite.

- **Tables:** plural, snake_case (`categories`, `products`, `brands`, `orders`, `order_items`, `users`).
- **Primary keys:** UUID/ULID `id`, *in addition to* the human-readable `slug` already used everywhere in the frontend — `slug` stays unique-indexed and is what URLs/route params continue to use.
- **Category tree:** the frontend hard-assumes exactly 3 levels (top/child/grandchild). Model this either as three explicit tables mirroring `Category`/`ChildCategory`/`GrandchildCategory`, or a single self-referencing `categories` table with a nullable `parent_id` plus a `level` enum — either way, `resolveCategoryPath()`'s contract (resolve a slug path to top/child/grandchild + breadcrumb) must keep working unchanged.
- **Product–category relation:** store a `category_id` FK to the leaf (grandchild) category, and denormalize the `[top_slug, child_slug, grandchild_slug]` path (mirroring today's `categorySlugPath`) for the prefix-matching queries `getProductsByCategoryPath()` already performs, so that query pattern doesn't need to change shape.
- **Money:** integer minor units (cents), not floats. The current generated mock data uses JS floats (`price: 312.99`) for simplicity — a real database must not repeat that; `formatPrice()` in `lib/format.ts` becomes the single conversion boundary.
- **Timestamps:** `created_at` / `updated_at` on every table.
- **Deletes:** soft-delete products (`deleted_at`) rather than hard-delete, so historical orders keep valid references.
- **Migrations:** one versioned, linear migration history; schema-as-code (e.g. Prisma or Drizzle) is the source of truth, not manual DDL.

## API conventions

One route exists today: `GET /api/products?ids=a,b,c` (`app/api/products/route.ts`), returning `{ products: Product[] }`. Conventions below generalize that pattern for future routes:

- **Route handlers** under `app/api/*`, REST-shaped (`GET` for reads, `POST`/`PATCH`/`DELETE` for mutations once they exist).
- **Response envelope:** `{ <resourceName>: T | T[] }` for success (matches the existing `{ products }` shape) — errors as `{ error: { message, code } }`, not a bare string or thrown HTML error page.
- **Reads are public and cache-friendly** where the data is catalog data (products, categories, brands); **mutations require auth** once Phase 2 accounts exist — no route should assume a logged-in user until then.
- **List endpoints paginate.** Given the catalog is already 2,832+ products, any future "list products" endpoint should be cursor-based from day one, not offset-based.
- **Validate input** (e.g. with `zod`) at the route boundary before it reaches `lib/` query helpers — `lib/products.ts`/`lib/category-utils.ts` should be able to assume well-formed input.
- **Keep the API and the direct-import path consistent.** Server Components should keep importing `lib/products.ts` / `lib/category-utils.ts` directly (no network hop); the API routes exist specifically for the client-component case where data can't cross the RSC boundary directly (see `CLAUDE.md`).

## Future AI roadmap

Sequenced after Phase 1–2 (real backend + accounts) since most of this needs real behavioral/order data to be more than a novelty:

- **Conversational category navigation** — a shopping assistant that can traverse the 1,416-leaf taxonomy conversationally ("something for a rainy camping trip") and land the user on the right grandchild category or filtered product set, rather than requiring them to know the taxonomy path.
- **Semantic/natural-language search** — layer a real embeddings-based search behind the existing search bar UI, so query intent (not just substring match) drives results; the current `searchCategories()`/`searchProducts()` string matching becomes the fallback, not the primary path.
- **Personalized merchandising** — replace the static, same-for-everyone rail contents (`getDealsProducts()`, `getRecommendedProducts()`, etc.) with per-user ranked versions once order/browsing history exists; the `ProductRail` component contract is already generic enough to accept any product list, so this is a data-source swap, not a UI rewrite.
- **AI-assisted catalog operations** — auto-suggest the correct leaf category and generated marketing copy for new SKUs at import time, replacing/augmenting the current hand-authored `scripts/*-source.mjs` descriptions.
- **Visual search** — "find products like this photo," made feasible by every product already carrying a consistent square product image.
- **Anomaly detection** — fraud/returns-abuse signals once real orders exist (Phase 1+).

## Glossary

- **Top / child / grandchild category** — the three fixed levels of the taxonomy (`Category` → `ChildCategory` → `GrandchildCategory` in `app/data/categories.ts`). A "leaf" category always means a grandchild — the level products are actually attached to.
- **Rail** — a horizontally-scrolling row of products on the homepage (e.g. Today's Deals), implemented once as `ProductRail` and reused per section.
- **Mega menu** — the desktop hover/click navigation panel showing a category's children, grandchildren, banner image, and popular brands in one view.
