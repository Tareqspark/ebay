// Pure, client-safe category helpers with no DB/"server-only" dependency —
// import from here (not lib/category-utils) in "use client" components.
// lib/category-utils.tsx re-exports these for server-side callers.

export function categoryHref(...slugs: string[]): string {
  return `/category/${slugs.join("/")}`;
}

/**
 * How many featured departments get a shortcut in the main nav bar.
 *
 * The bar is one row beside "All Categories", so it can't hold every
 * featured department — there are currently 16 and even ten crowd a
 * 1440px screen. The cap itself is fine; what wasn't is that it applied
 * silently, so ticking "Featured" on an 11th department appeared to do
 * nothing. The admin category tree reads this same constant to show which
 * departments actually make the bar, and sort order decides the winners.
 *
 * Shared from here rather than each component so the nav and the admin
 * screen explaining the nav can never disagree.
 */
export const NAV_QUICK_LINKS = 10;

export const POPULAR_SEARCHES: string[] = [
  "Wireless Earbuds",
  "4K Smart TVs",
  "Running Shoes",
  "Air Fryers",
  "Gaming Laptops",
  "Robot Vacuums",
  "Coffee Makers",
  "Skincare Sets",
  "Office Chairs",
  "Smartwatches",
];
