// Pure, client-safe category helpers with no DB/"server-only" dependency —
// import from here (not lib/category-utils) in "use client" components.
// lib/category-utils.tsx re-exports these for server-side callers.

export function categoryHref(...slugs: string[]): string {
  return `/category/${slugs.join("/")}`;
}

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
