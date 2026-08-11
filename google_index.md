# google_index.md

Search-indexing inspection of **www.cartebay.com**, carried out 2026-08-11. Nothing in
here has been actioned — this is the working brief for that job.

`CLAUDE.md` is the engineering reference and `PRODUCT.md` the north star; this file is a
point-in-time audit. Re-check anything before acting on it, particularly the DNS and
certificate facts, which change the moment someone touches the DigitalOcean panel.

---

## Headline

**The site is not indexed at all.** A `site:cartebay.com` search returns no pages from the
domain. That is the expected result given the findings below, not a mystery to debug.

---

## Evidence gathered

Commands and their output at the time of the audit.

| Check | Result |
|---|---|
| `dig +short cartebay.com A` | *(empty — no A record)* |
| `dig +short www.cartebay.com A` | `174.138.32.27` |
| `curl https://www.cartebay.com/robots.txt` | `404` |
| `curl https://www.cartebay.com/sitemap.xml` | `404` |
| `certbot certificates` | one cert, `Certificate Name: www.cartebay.com`, SAN covers **`www.cartebay.com` only** |
| nginx `server_name` | `cartebay.com www.cartebay.com` (already handles both, with a 301) |
| `grep -rln "application/ld+json\|schema.org"` | no matches anywhere |
| `grep -rn "metadataBase\|canonical\|openGraph"` | no matches anywhere |
| `generateMetadata` present | product, category, collection, search |
| Homepage transfer | ~2.5 MB, first byte ~4–8 s (measured off-network) |

Nameservers are DigitalOcean (`ns1/ns2/ns3.digitalocean.com`), so DNS is managed in the
DigitalOcean control panel, not at the registrar.

---

## 1. The apex domain does not resolve — blocking

`cartebay.com` has **no A record**. Only `www.cartebay.com` exists. Anyone typing the bare
domain gets a DNS failure.

This went unnoticed because **Chrome hides the `www.` prefix in the address bar**, so the
browser looks like it is on `cartebay.com` when it is not.

Fixing it takes **two** steps, and doing only the first makes things worse:

1. Add an `A` record for the apex → `174.138.32.27`.
2. **Re-issue the certificate to cover both names.** The current Let's Encrypt cert covers
   `www.cartebay.com` only. Add the DNS record without this and apex visitors get a
   certificate warning instead of a DNS error — which reads to a shopper as a compromised
   site, and is worse than the domain simply not loading.

nginx is already configured for both names and redirects to `$host`, so no server config
change is needed beyond the certificate.

> Requires access to the DigitalOcean DNS panel, plus a certbot run on the droplet.

---

## 2. No robots.txt and no sitemap — blocking

Both return 404. Next supports `app/robots.ts` and `app/sitemap.ts` as file conventions;
neither exists.

The catalogue is **11,708 products across 1,652 category nodes**. With no sitemap, Google
finds URLs only by following links, on a new domain with no backlinks. Category routes
(`app/category/[...slug]`) also have no `generateStaticParams` and render on demand, so
each crawl is a server render.

`robots.txt` should disallow `/api/`, `/admin/`, `/uploads/`, `/checkout`, `/cart` and
`/account`.

**The sitemap should be deliberately partial — see section 5.**

---

## 3. On-page metadata gaps

`generateMetadata` already covers product, category, collection and search pages, which is
the hard part. Missing:

- **`metadataBase`** — without it Next cannot build absolute URLs, so canonical and
  Open Graph tags are broken even once added. Fix this first; the rest depends on it.
- **Canonical tags** — filter and sort parameters generate duplicate URLs with no
  canonical to consolidate them.
- **Open Graph / Twitter cards** — every share on WhatsApp, Facebook or Snapchat currently
  renders as a bare link with no image or title.
- **JSON-LD `Product` schema** — none anywhere in the codebase.

### JSON-LD is the highest-value item here

`Product` structured data (price, availability, `AggregateRating`) is what turns a plain
blue link into a result showing price and stock. For ecommerce it is the single
highest-ROI technical SEO item. `BreadcrumbList` is worth adding alongside it, and the
three-level category tree maps onto it directly.

---

## 4. Core Web Vitals

Homepage is ~2.5 MB with a first byte around 4–8 seconds measured off-network. That is an
LCP failure, and Core Web Vitals feed ranking. This is the same payload problem already
tracked as a performance item — it is also an SEO problem.

Note the droplet itself was idle (load 0.02) during the measurement; the size of the
payload and the link between here and the droplet dominate, not CPU.

---

## 5. The strategic point — read before doing any of the above

**Indexing all 11,708 dropship pages right now is more likely to hurt than help.**

Every product currently carries a `picsum.photos` placeholder image and generated copy,
and the catalogue is CJdropshipping's — the same supplier descriptions thousands of other
stores publish. Google's helpful-content systems specifically target thin, syndicated,
near-duplicate catalogue pages. Submitting all of it at once risks a site-wide quality
assessment that is slow and painful to recover from.

The technical fixes in sections 1–4 are **necessary but not sufficient**. A small number of
products with real photography and genuinely written descriptions will outrank a large
index of supplier boilerplate, and will not put the domain at risk.

Concretely: the first sitemap should contain the homepage, the 31 departments,
collections, and **only products with real images** — not the whole catalogue.

---

## Suggested order of work

### Unblock
1. Apex `A` record **and** a certificate covering both names.
2. `app/robots.ts`.
3. `metadataBase` + canonical tags.
4. `app/sitemap.ts` — partial, per section 5.
5. Verify the property in **Google Search Console** and submit the sitemap. Until this
   exists there is no visibility into what Google actually does with the site.

### Earn the ranking
6. JSON-LD `Product` + `BreadcrumbList`.
7. Open Graph images.
8. Reduce the homepage payload.
9. Replace placeholder imagery on the products actually intended to sell. The admin
   category-image uploader added on 2026-08-11 is the pattern products need.

### Cheap extra
10. **Bing Webmaster Tools** — indexes new domains faster than Google, supports IndexNow
    for near-instant submission, and feeds ChatGPT browsing. Roughly ten minutes.

---

## Open questions for the owner

- Is the apex domain wanted as primary, or should `www` stay canonical? Either is fine;
  it needs deciding before canonical tags go in, because they must agree with the 301.
- Which products are considered "real" enough to index first? That set defines the
  first sitemap.
- Is there a Google Search Console account already, or does one need creating?

---

## Known-stale elsewhere

The admin **Settings → SEO & Domains** page listed `cartebay.com` as "Serving", which was
wrong — it was written from a screenshot rather than a DNS lookup. Corrected on
2026-08-12 to show that only `www` resolves. Update it again once the apex is live.
