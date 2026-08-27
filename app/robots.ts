import type { MetadataRoute } from "next";

const BASE_URL = process.env.AUTH_URL?.replace(/\/$/, "") ?? "https://www.cartebay.com";

/**
 * Crawl rules for the storefront.
 *
 * Two jobs. Keep crawlers out of pages that are private or meaningless to
 * index, and keep them out of the filter combinations, which are effectively
 * an infinite URL space: 502 categories multiplied by every sort order, brand
 * selection, price band and rating filter. Googlebot was already spending 942
 * requests on /cart and 938 on /account/wishlist before this existed, and the
 * catalogue is on its way to 50,000 products — crawl budget needs to go to
 * products, not to permutations of the same listing.
 *
 * ?page= is deliberately allowed: it is how a crawler reaches products beyond
 * the first 24 of a category, so blocking it would hide most of the catalogue.
 *
 * No sitemap is declared because none exists yet. Pointing robots.txt at a
 * missing /sitemap.xml is worse than staying silent — it reports a fetch error
 * in Search Console on every crawl.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    "/admin",
    "/api/",
    "/account",
    "/cart",
    "/checkout",
    "/track-order",
    "/uploads/",
  ];

  // Filter parameters produce endless near-duplicate URLs. Sorting or
  // narrowing a category never yields a page worth indexing on its own.
  const filterTraps = ["/*?*sort=", "/*?*brands=", "/*?*min=", "/*?*max=", "/*?*rating="];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /search is a free-text query space — unbounded, and every result
        // page duplicates content that already lives on a category page.
        disallow: [...privatePaths, "/search", ...filterTraps],
      },
      {
        /**
         * Crawlers that collect training data rather than send visitors.
         * Blocked because they take the catalogue and return nothing to the
         * shop. This is a commercial preference, not a security measure — the
         * whole rule can be deleted to reverse it, and none of these honour
         * anything but robots.txt anyway.
         */
        userAgent: ["GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Bytespider", "Amazonbot", "meta-externalagent"],
        disallow: "/",
      },
    ],
    host: BASE_URL,
  };
}
