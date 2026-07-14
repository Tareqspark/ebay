# Baruashop

A premium, single-vendor ecommerce storefront built with Next.js 15, React 19, TypeScript, Tailwind CSS, and shadcn/ui. Inspired by the browsing experience of major US ecommerce sites — original branding and UI, not a marketplace.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

The full category taxonomy (31 top-level categories, 205 child categories, 1,416 grandchild categories) and the product catalog are generated from compact source files rather than hand-authored:

```bash
node scripts/generate-categories.mjs   # scripts/category-source.mjs -> app/data/categories.ts
node scripts/generate-brands.mjs       # scripts/brand-source.mjs   -> app/data/brands.ts
node scripts/generate-products.mjs     # scripts/generate-products.mjs -> app/data/products.ts
```

Edit the `*-source.mjs` files and re-run the corresponding script to regenerate the data files — do not hand-edit the generated `app/data/*.ts` files directly.

## Structure

- `app/data/` — generated category, brand, and product data
- `lib/` — data query helpers (`category-utils.ts`, `products.ts`), shared types, formatting
- `components/layout/` — header, mega menu, mobile nav, footer
- `components/search/` — search bar with autocomplete, recent/popular searches
- `components/category/` — breadcrumb, tree sidebar, category landing page sections
- `components/product/` — product card, rails, filters/sort/grid explorer
- `components/home/` — homepage sections (hero, deals, flash sale, newsletter, etc.)
- `app/category/[...slug]/` — category landing pages (top/child/grandchild levels)
- `app/product/[slug]/` — product detail page
- `app/search/` — search results page

Product images are placeholder photos from picsum.photos, seeded deterministically per product/category slug.
