# category-mapping.md

Read-only comparison of Cartebay's category tree against CJdropshipping's, produced
2026-08-17 to decide whether to rebuild our taxonomy on theirs.

Nothing here has been applied. Companion to `cjsourcing.md`.

---

## The two trees

| | Cartebay | CJdropshipping |
|---|---|---|
| Departments | 32 | **14** |
| Mid-level | 205 | **89** |
| **Leaf categories** | **1,416** | **577** |
| Total nodes | 1,653 | 680 |

Ours is **2.5× finer than our only supplier's**. That single ratio explains both
symptoms: 715 leaves can never fill because CJ has no product concept for them, and
1,416 destinations competing for 577 real product types is what makes automated
filing pick wrong.

## Attempting a name-based mapping

Matching our leaf names to CJ's, requiring at least half the words to correspond:

| | Count | Share |
|---|---|---|
| Ours with a plausible CJ counterpart | 667 | 47% |
| **Ours with no CJ counterpart** | **749** | **53%** |
| …of those, holding products | 361 | — |
| …products sitting in them | **4,043** | 34% of catalogue |
| **CJ leaves we have no category for** | **332** | 58% of CJ's tree |
| CJ leaves receiving more than one of ours | 129 | — |
| Our leaves that would merge together | 551 | — |

## The decisive finding: do not map by name

The mapping above is unreliable, and its errors are the *same class of error* this
whole exercise is meant to remove. The worst collapses:

| CJ leaf | Absorbs | Because |
|---|---|---|
| Consumer Electronics > **Camera Drones** | Backup Cameras, DSLR Cameras, Film Cameras, 360 Cameras — 18 of ours | shares "camera" |
| Home & Garden > **Invitation Cards** | Greeting Cards, Gift Cards, Trading Cards, **Capture Cards** — 12 of ours | shares "cards" |
| Pet Supplies > **Pet Toy Set** | Bath Toys, Stacking Toys, Pool Toys, Toy Storage — 14 of ours | shares "toy" |
| Bags & Shoes > **Vulcanize Shoes** | Golf Shoes, Tennis Shoes, Training Shoes, **Shoe Racks** — 11 of ours | shares "shoe" |

A capture card is not an invitation card. A DSLR is not a drone. **Word overlap between
two category names fails exactly as word overlap between a title and a category name
failed** — which is what produced the 66% mis-filing in the first place.

**So the rebuild must not be driven by name matching.** It should be driven by
`categoryId`, which CJ returns on every product and which joins cleanly against their
tree — verified live at **99 of 100 products**.

## What we are missing, and what we invented

**332 CJ leaves have no home in our tree** — 58% of what CJ actually sells is
uncategorised for us. The gaps are concentrated where CJ is deepest:

- Women's Clothing: Hats & Caps, Gloves & Mittens, Prescription Glasses, Eyewear,
  Casual Jackets, Baseball Jackets, and an entire Couple & Parent-Child range
- These are real, stocked product types that currently have nowhere correct to go

That is the other half of the mis-filing. A flat cap went to *Shoes > Flats* partly
because **we have no Hats & Caps leaf** — CJ does.

**Conversely, our largest CJ-less leaves are mostly dumping grounds**, not genuine
assortment:

| Products | Our leaf | Reality |
|---|---|---|
| 162 | Home Improvement > Chain & Rope | necklaces, on the word "chain" |
| 138 | Musical Instruments > Straps | watch and bag straps |
| 114 | Health & Beauty > Cotton Swabs & Balls | anything cotton |
| 101 | Automotive > Winter Tires | — |

So the "4,043 products at risk" is misleading. Most are already in the wrong place;
re-filing them by CJ id is a correction, not a loss.

---

## The proposed rebuild

1. **Mirror CJ's structure** — 14 / 89 / 577 — storing each node's CJ `categoryId`.
2. **Keep our own display names.** Mapping is by id, so labels are free. "Bags & Shoes"
   can read "Shoes & Bags"; "Beauty Tools" can read "Skincare Tools". Shoppers never
   see CJ's supplier vocabulary.
3. **Backfill every product by `categoryId`.** Page `/product/list` at 100 per call —
   roughly 120 calls, minutes rather than hours, negligible API points.
4. **Place the 2 own-brand products by hand.**
5. **Retire the old tree** once nothing references it.

### What it fixes

- **Mis-filing**: from 66% to CJ's own error rate. Their categorisation is imperfect —
  "Persimmon Soap" sits under *Beauty Tools*, a keychain under *Home Office Storage* —
  so expect roughly 10–15% off, not zero. Inherited errors, far fewer, and not random.
- **Empty categories**: largely gone. A tree shaped like the supply fills up.
- **The 332 missing leaves**: added, so products finally have correct homes.

### What it costs

- **Every category URL changes.** All 1,653. Normally an SEO catastrophe — but
  `google_index.md` confirms **nothing is indexed yet**, which makes this the cheapest
  moment this change will ever be. Waiting makes it permanent.
- **Taxonomy coupled to one supplier.** A second source later must be mapped into a
  CJ-shaped tree.
- **Category images.** 31 department tiles were generated for the current departments;
  a 14-department tree needs a new set. The admin uploader handles this.
- **Loss of merchandising intent.** Departments like Collectibles & Fine Art and
  Musical Instruments disappear because CJ doesn't stock them. That is honest — they
  were empty — but it narrows what the store claims to sell.

---

## Open decisions

1. **Mirror exactly, or mirror-and-prune?** CJ's 577 includes leaves we may never
   stock. Starting with only the ~250 that have imported products, and adding the rest
   as they fill, gives a store with no empty categories at all.
2. **Whose names?** Recommend ours, mapped by id.
3. **Departments: 14 or a middle ground?** Going 32 → 14 is a large visible change.
   Some of ours could be kept as re-labelled groupings of CJ's mid-level.
4. **The 2 own-brand products** — do they need departments CJ doesn't have?

## Recommendation

Rebuild on CJ's structure, keyed by `categoryId`, with our own names, **pruned to the
leaves that actually hold products** — then let it grow as sourcing fills the gaps.

Do it before any indexing work, and before Stripe goes live, so the URL churn costs
nothing and no customer sees the store change shape underneath them.
