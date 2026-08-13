# cjsourcing.md

Filling empty leaf categories with real CJdropshipping products, by searching CJ's
catalogue for the leaf's own name instead of relying on CJ's category tree.

Run script: `scripts/source-empty-leaves.ts`. **Paused on 2026-08-13 to stop spending API
points.** Everything below is what you need to resume without rediscovering it.

---

## Why this exists

`scripts/import-cj-products.ts` sweeps **CJ's** category tree and maps each CJ leaf onto
ours. Our tree has **1,416 leaves; CJ's has about 540**, so more than half of ours were
never a destination for anything the sweep produced.

"Stacking Toys" is empty because CJ has no such *category* — not because CJ sells no
stacking toys. This script closes that gap by searching on the leaf name, the way a human
sourcer would.

---

## Where it stopped

| | |
|---|---|
| Leaf categories | 1,416 |
| Empty when this started | 741 |
| **Newly filled** | **24** |
| **Still empty** | **717** |
| Listings written | **98** |
| Leaves examined | 47 of 741 |
| API points used | ~4,360 (run total), 8,670/50,000 that day |

Row counts stayed consistent — `products`, `inventory` and `product_meta` all read
**11,807**, so no orphans were created.

Pre-run backup: `/home/cartebay/pre-sourcing-1786620536.sql` (18 MB, on the droplet).

---

## The economics — read before resuming

Measured over 45 leaves: **≈97 API points per leaf.**

- 717 remaining leaves ≈ **69,500 points**
- Daily budget is **50,000**

So finishing costs roughly **1.5 days of your entire daily allowance**, and CJ's rate limit
of **1 request/second** means about **an hour of wall-clock time** on top.

**Only about 55% of leaves find anything**, so that spend buys perhaps 390 filled
categories, not 717. Points are consumed searching the other 45% too — every leaf costs
whether or not it yields.

Cheaper options, in order of value per point:

1. **Target the departments you actually sell.** Electronics (53 empty), Computers &
   Tablets (51), Home & Kitchen (43) and Sporting Goods (43) hold most of the gap. Sourcing
   those alone is a fraction of the cost.
2. **Lower `SOURCE_PRODUCTS_PER_LEAF`** from 4 to 2. Roughly halves the per-leaf detail
   calls, which are the bulk of the spend.
3. **Delete or merge leaves CJ can't supply.** Free, and better for search — 717 empty
   category pages are thin content (see `google_index.md`).

---

## How to run it

On the droplet, as the `cartebay` user, from `/home/cartebay/app`:

```bash
# Resume from the checkpoint — safe to re-run, already-done leaves are skipped
sudo -u cartebay bash -c "nohup node --env-file=.env.local \
  ./node_modules/.bin/tsx scripts/source-empty-leaves.ts > /tmp/source-run.log 2>&1 &"

# Watch it
tail -f /tmp/source-run.log

# Stop it. Note the bracket — 'source-empty-leaves' plainly would match the
# pkill command's own line and kill your SSH session instead.
pkill -f "source-empty-leave[s]"
```

**Always dry-run a change first** — it searches and validates but writes nothing, and
prints each matched product title so you can judge relevance:

```bash
SOURCE_DRY_RUN=1 SOURCE_MAX_LEAVES=10 node --env-file=.env.local \
  ./node_modules/.bin/tsx scripts/source-empty-leaves.ts
```

### Knobs

| Variable | Default | Notes |
|---|---|---|
| `SOURCE_PRODUCTS_PER_LEAF` | 4 | Distinct products per leaf. The main cost lever. |
| `SOURCE_MAX_VARIANTS` | 2 | Listings per product (colours/sizes). |
| `SOURCE_MAX_LEAVES` | ∞ | Cap leaves examined this run. |
| `SOURCE_DRY_RUN` | off | `1` = search and report, write nothing. |

### State files (gitignored)

- `scripts/.cj-source-checkpoint.json` — leaves already done. **Delete only to start over.**
- `scripts/.cj-source-report.json` — filled/unfilled summary with the queries tried.

Progress is checkpointed after **every leaf**, so a kill, a crash or exhausted points all
resume cleanly.

---

## CJ API facts learned the hard way

Each of these produced **silent zero results** before it was found.

**`/product/listV2` ignores the search parameter.** It accepts `productNameEn` and pays no
attention to it — "dress" and "marker" both returned the same unrelated *"Temporary Metal
Waterproof Key Box"*. Use **`/product/list`**, which really filters.

**Pagination differs.** `/product/list` uses `pageNum`/`pageSize`, not `page`/`size`.

**Field names differ between the two endpoints.** `/product/list` items are keyed
**`pid`** and **`productNameEn`**; `listV2` uses `id` and `nameEn`. Read the wrong one and
you get an empty title, which fails every match without erroring.

**The rate limit is 1 request/second**, not 100. A 200 ms gap trips *"Too Many Requests,
QPS limit is 1 time/1second"* within a few calls.

**Rate limiting is not quota exhaustion.** They must be handled differently: back off and
retry on rate limits, stop only on points exhaustion (code `16900500`).

> ### Still broken in `scripts/import-cj-products.ts`
> That older script has **both** of the last two problems: it throttles at 200 ms assuming
> 100 QPS, and its error check treats "too many requests" as fatal quota exhaustion. So
> exceeding the rate makes it abort the whole run rather than slow down. It has not been
> fixed — only the new script has.

---

## How a product is judged to belong

CJ's keyword search is loose, so accepting whatever comes back is how a "Car Ghost Claw
Sticker" ends up under "Beading Thread" (a real mis-filing from an earlier pass, recorded
in `scripts/fix-cj-categories.ts`). Two rules:

**1. Every distinctive word of the leaf must be in the title.** Generic words —
*accessories, other, supplies, parts, sets, kits* — are stripped first; a leaf that is
nothing but generic words ("Other Accessories") borrows its parent's words instead.

**2. Those words must sit close together** — within a window of `wordCount + 2`.

Rule 2 does the heavy lifting. Presence alone is far too weak against CJ's twenty-word
titles:

| Title | Verdict |
|---|---|
| *"Women Bike, 26 In Beach Cruiser Bike, 7-Speed Adult City Bicycle With Carbon Steel Rack"* | **rejected** — a bicycle, not a bike rack |
| *"Bike Stand 2 Pack, Foldable Freestanding Bike Storage Rack"* | accepted |
| *"7-Piece Stainless Steel Putty Knife Set: Putty Knives, Plastering Knives, And Palette Knives"* | accepted for Palette Knives — it genuinely is one |
| *"Maifanite Horseshoe-handle Six-piece Knife Set"* | rejected for Palette Knives |

Validation runs on the **list** response, before spending a detail call — quality control
and cost control in the same step.

Matches are logged in dry-run mode precisely so this can be re-checked after any change to
the rules. Do that before every real run.

---

## What can't be filled, and what to do with it

**About 45% of leaves find nothing, and that is the correct outcome.** Confirmed absent
from CJ so far: Yarn Bowls, Sewing Notions, Sewing Patterns, Party Favors, Car Stereos,
Dash Camera Mounts, Oil Filters & Funnels.

Leaves with no genuine match are **left empty and reported** rather than filled with
something adjacent. A wrong product in a category misleads shoppers, and per
`google_index.md` it is exactly the thin-content pattern that damages search standing.
Empty is recoverable; mis-filed at scale is not.

The unfilled list in `.cj-source-report.json` is therefore useful output in its own right —
it is the shopping list for a second supplier, or the set of categories to delete.

---

## Open decisions

- How much of the remaining 717 is worth ~69,500 points? Departments you actually intend
  to sell, or all of them?
- Drop `SOURCE_PRODUCTS_PER_LEAF` to 2 to roughly halve the cost per leaf?
- Prune the leaves CJ can't supply, rather than leaving empty pages? Best answer for both
  shoppers and indexing.
- **"Barua insurance"** is an empty top-level department in the category tree and is not a
  shopping category. It should be removed rather than sourced for.
