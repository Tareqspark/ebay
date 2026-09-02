# Performance

Measured 2 September 2026, prompted by a WebPageTest run against
`www.cartebay.com` that returned an 18.77s Largest Contentful Paint.

## The shape of the problem

| Metric | Value |
| --- | --- |
| Time to First Byte | 16.6 s |
| First Contentful Paint | 17.4 s |
| Largest Contentful Paint | 18.8 s |
| Page weight | 1 MB |
| Requests | 99 |
| Cumulative Layout Shift | 0 |
| Total Blocking Time | 0.088 s |

**The front end is not the problem.** A 1 MB page over 99 requests is
unremarkable, layout shift is zero and blocking time is negligible. TTFB alone
accounts for 16.6 s of an 18.9 s load, and every other metric is simply waiting
behind it. Optimising images, bundles or scripts would move nothing.

Confirmed from the server: `/robots.txt` answers in **10 ms**, so Next.js and
nginx are healthy. The homepage takes 13–23 s. The cost is entirely in the data
the homepage fetches.

## Root cause

Storefront queries filter on a `sellable` guard — a correlated subquery
introduced when hidden and archived products were found to be publicly
purchasable:

```sql
exists (
  select 1 from product_meta m
  where m.product_id = products.id
    and m.visibility = 'visible'
    and m.status = 'active'
)
```

`product_meta` carried only a PRIMARY key. MySQL therefore refused to drive from
`products`, and instead full-scanned `product_meta`, built a temporary table and
filesorted it, before touching `products` at all:

```
table=m  type=ALL  key=NONE  rows=143,521  Using temporary; Using filesort
```

The proportions are what make this galling. Of **148,039** rows in
`product_meta`, exactly **33** are not sellable — 0.022%. The database was
spending five seconds to exclude thirty-three rows.

Two conditions turned a bad query into an unusable one:

- The catalogue grew from ~11,800 products to **147,789** during the variant
  backfill. The subquery was affordable at the old size and is not at this one.
- The droplet has **one CPU core**. Ten rail queries run per homepage request,
  and they serialise on that core. Load average during measurement was 2.30.

## Applied on 2 September

Eight indexes, added while diagnosing. All are non-destructive and reversible
with `DROP INDEX`.

| Index | Table | Columns |
| --- | --- | --- |
| `pm_sellable_idx` | `product_meta` | `(visibility, status, product_id)` |
| `products_rating_count_idx` | `products` | `(rating_count)` |
| `products_rating_value_idx` | `products` | `(rating_value, rating_count)` |
| `products_is_deal_idx` | `products` | `(is_deal)` |
| `products_is_flash_idx` | `products` | `(is_flash_sale)` |
| `products_is_trending_idx` | `products` | `(is_trending)` |
| `products_is_new_idx` | `products` | `(is_new_arrival)` |
| `products_is_best_idx` | `products` | `(is_best_seller)` |

Measured effect on the individual queries:

| Query | Before | After |
| --- | ---: | ---: |
| Most reviewed | 2,230 ms | **18 ms** |
| Best sellers | 2,102 ms | **14 ms** |
| Flash sale count | 1,640 ms | **8 ms** |
| Deals count | 481 ms | **48 ms** |
| New arrivals | 3,308 ms | *see below* |

Homepage TTFB fell from 13–23 s to 6.5–11.7 s. Better, not fixed.

### Why New Arrivals did not stay fixed

`pm_sellable_idx` alone took it to 13 ms. Adding the flag indexes changed the
optimiser's cost estimate and it reverted to driving from `product_meta`:

```
new arrivals, EXISTS as written        5,389 ms
same, forced to drive from products       10 ms   (STRAIGHT_JOIN)
no sellability filter at all              15 ms
```

The plan is the problem, not the absence of an index. An optimiser hint would
work but is brittle — the next statistics refresh can undo it. The structural
fix is below.

## Plan

Ordered by measured impact per unit of work.

### 1. Denormalise sellability onto `products`

The largest single win, and the only one that fixes New Arrivals properly.

Replace the correlated subquery with an indexed boolean column on `products`.
Every storefront query then filters on a plain column instead of joining to
`product_meta`, and the worst query goes from 5,389 ms to roughly 10 ms.

The scope is the sync, not the query. Sellability is written in three admin
actions (`setProductStatusAction`, `setProductVisibilityAction`,
`deleteProductsAction`) and two importers, and each needs to update the new
column alongside `product_meta`. A one-off backfill sets the existing 148,039
rows.

Risk is duplicated state drifting. Mitigate with a periodic consistency check
rather than trusting the writers — the correct value is always derivable from
`product_meta`, so drift is detectable and repairable.

### 2. Cache the homepage

The homepage fires **ten rail queries per request**. Those rails rotate on a
daily seed, so every visitor for twenty-four hours triggers the same ten queries
and receives the same answer. Nothing about them is per-visitor except
`getPersonalizedRecommendations`, which already falls back to a shared result
for signed-out shoppers.

Wrapping the shared rails in `unstable_cache` with a daily revalidate removes
almost all homepage database work. Two rails — Featured Deals and Weekly Top
Deals — currently hold zero products and still cost a query each; those should
be dropped rather than cached.

### 3. Raise `innodb_buffer_pool_size`

It is at the **128 MB default** against a **348 MB** database:

| Table | Size |
| --- | ---: |
| `products` | 276 MB |
| `inventory` | 41 MB |
| `product_meta` | 26 MB |

The working set does not fit, so MySQL re-reads from disk continuously. 512–768
MB is the sensible range given Next.js holds ~480 MB on a 2 GB box. Requires a
MySQL restart.

### 4. Let the backfill finish, then reassess capacity

Load average 2.30 on **one core**, with the variant backfill competing for it.
The backfill is 98% complete and resolves itself within hours. Re-measure
afterwards on a quiet box.

If the site is still slow with items 1–3 done and nothing else running, the
honest conclusion is that one core and 2 GB is undersized for a 148,000-product
catalogue, and the fix is a larger droplet rather than more tuning.

### 5. Trim per-request work

`collapseVariants` over-fetches four times the requested limit on every rail to
survive variant collapsing. Once sellability is a plain column that over-fetch
is cheap, but it is worth revisiting alongside the empty rails in item 2.

## Sequencing

Items 1 and 2 together should bring the homepage under a second — one removes
the slow query, the other stops running it per request. Item 3 is configuration.
Item 4 largely happens on its own.

All of it should be measured against a quiet server. Benchmarking while the
backfill saturates the only core produces numbers that move on their own, which
is why the figures above vary between runs.

## What was ruled out

- **Image optimisation.** 1 MB total page weight.
- **JavaScript bundle size.** Total Blocking Time 0.088 s.
- **Layout instability.** CLS 0.
- **Network, DNS, TLS.** Under 1 s combined, measured client-side.
- **Next.js or nginx overhead.** A trivial route answers in 10 ms.
