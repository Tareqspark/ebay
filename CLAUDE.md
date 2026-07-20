# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (next dev --turbopack)
npm run build    # production build (next build --turbopack)
npm run start    # serve the production build
npm run lint     # eslint .
npx tsc --noEmit # type-check (no separate script defined)
```

There is no test suite/runner configured in this repo.

### Regenerating data

Category, brand, and product data are generated, not hand-authored. Never edit `app/data/categories.ts`, `app/data/brands.ts`, or `app/data/products.ts` directly — edit the corresponding `scripts/*-source.mjs` and re-run:

```bash
node scripts/generate-categories.mjs   # scripts/category-source.mjs -> app/data/categories.ts
node scripts/generate-brands.mjs       # scripts/brand-source.mjs   -> app/data/brands.ts
node scripts/generate-products.mjs     # reads category-source.mjs + brand-source.mjs -> app/data/products.ts
node scripts/generate-admin-data.mjs   # scripts/admin-source.mjs + scripts/cj-source.mjs -> app/data/admin/*.ts (orders, inventory, disputes, etc.)
node scripts/generate-cj-catalog.mjs   # scripts/product-data.mjs -> data/cj-catalog.json (50,000-item CJdropshipping catalog, server-only — see below)
```

`scripts/slugify.mjs` is shared by all three storefront generators — it's what keeps a category's slug, a product's `categorySlugPath`, and route URLs (`/category/[...slug]`) all consistent. Product generation must run after category/brand source changes since it derives brand pools and category leaves from them. `generate-admin-data.mjs` must run after `generate-products.mjs` since admin product/inventory/order records key off the generated `PRODUCTS` array.

## Architecture

Single-vendor storefront (Next.js 15 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui). Brand name is "Baruashop" (appears in `app/layout.tsx` metadata, `main-header.tsx`, `footer.tsx`, category page metadata — grep for it if renaming again).

### Category tree

Three fixed levels, typed in `app/data/categories.ts`: `Category` (top, has `icon`/`image`/`description`/`featured`) → `ChildCategory` → `GrandchildCategory` (leaf, `id`/`name`/`slug` only). All traversal/lookup helpers live in `lib/category-utils.ts` (`resolveCategoryPath`, `buildCategoryTree`, `searchCategories`, `categoryHref`, `flattenCategories`) — use these instead of walking `CATEGORIES` by hand. `categoryHref(topSlug, childSlug?, grandchildSlug?)` is the single source of truth for category URLs.

`app/category/[...slug]/page.tsx` is a catch-all handling all three depths via `resolveCategoryPath(slug)`. It has no `generateStaticParams` — with 1,652 category nodes it's intentionally rendered on demand rather than fully static.

### Product data

`Product.categorySlugPath` is `[topSlug, childSlug, grandchildSlug]`, matching the category tree slugs exactly. Query/derive helpers (filtering, sorting, brand rollups, price bounds, deals/flash-sale/trending/etc. selectors) live in `lib/products.ts` — extend there rather than filtering `PRODUCTS` inline in components.

### RSC boundary gotchas (both bit us during the build — watch for them)

1. **Icons are function references, not strings.** `Category.icon` is an actual `LucideIcon` component stored in the data. A Server Component may render it directly, but it can **not** be passed as a prop into a `"use client"` component (functions aren't serializable across that boundary — Next will throw at build time). When a client component needs an icon from a server parent, pass a pre-rendered node instead: `icon={<Tag className="h-5 w-5" />}`, not `icon={Tag}`. See `components/product/product-rail.tsx` (`icon?: ReactNode`) and its call sites in `app/page.tsx`. Same applies to any `Category`/`Product`-derived object containing an `icon` — strip it (see `HeroSlide` in `hero-banner.tsx`) before passing to a client component.
2. **Recently-viewed avoids shipping the product catalog to the client.** `hooks/use-recently-viewed.ts` only stores product IDs in `localStorage`. The actual product objects are fetched from `app/api/products/route.ts` (`GET ?ids=a,b,c`) after mount. Follow this pattern for any new client-side feature that needs product data by ID — don't import `PRODUCTS` from `app/data/products.ts` into a `"use client"` file (it's ~2,800 items).
3. **The CJ catalog is never `import`ed, only read from disk.** `lib/admin/cj-catalog.ts` loads the 50,000-item `data/cj-catalog.json` (~17MB) via `fs.readFileSync`, cached in module scope — it must stay a server-only module reached exclusively through `app/api/admin/cj-catalog/route.ts`. A plain `import`/`require` of that JSON (or of `cj-catalog.ts` from a `"use client"` file) would bundle the whole catalog for the browser. `components/admin/cj/cj-catalog-table.tsx` fetches one page at a time from that API route instead of using the app's normal fully-client-side `DataTable` pattern, which assumes the whole dataset already lives in the browser.

### shadcn is on Base UI, not Radix

`components.json` uses `"style": "base-nova"` — these shadcn primitives wrap `@base-ui/react`, not Radix. This means:
- Polymorphic composition uses the **`render` prop**, not `asChild`. E.g. `<Button render={<Link href="/x">Go</Link>} />`, not `<Button asChild><Link>...</Link></Button>`.
- When `render`-ing a `Button` as a non-`<button>` element (a `Link`/`<a>`), pass `nativeButton={false}` or Base UI logs an a11y warning.
- `Select`/`onValueChange` callbacks receive `string | null`, not just `string`.
- `Slider` value/`onValueChange` are typed `number | readonly number[]`; narrow with `Array.isArray()` before indexing.

### Images

All imagery (category banners, product photos) is `picsum.photos` placeholder images seeded deterministically by slug (e.g. `https://picsum.photos/seed/${slug}/900/900`) — there is no real product photography. The remote host is whitelisted in `next.config.ts`.

### Import alias

`@/*` maps to the repo root (see `tsconfig.json`), e.g. `@/lib/products`, `@/app/data/categories`, `@/components/ui/button`.
