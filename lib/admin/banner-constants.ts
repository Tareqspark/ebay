// Pure data and types, no "server-only" and no @/db import — safe to pull
// into a "use client" component, unlike lib/admin/banners.ts, which opens a
// database connection. Splitting these out is the same split that exists
// between permission-constants.ts and permissions.ts, and for the same
// reason: importing a label map should not drag mysql2 into the browser
// bundle. (db/schema is fine here — it's table definitions, not a client.)
import { bannerPlacement, bannerLinkType, bannerStatus } from "@/db/schema";

export type BannerPlacement = (typeof bannerPlacement)[number];
export type BannerLinkType = (typeof bannerLinkType)[number];
export type BannerStatus = (typeof bannerStatus)[number];

/** Human labels for the fixed slots, so the admin picks "Homepage — below hero" rather than a raw enum value. */
export const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  "top-bar": "Top bar (site-wide strip)",
  "homepage-top": "Homepage — below hero",
  "homepage-mid": "Homepage — between rails",
  "homepage-bottom": "Homepage — above newsletter",
  "category-top": "Category pages — below hero",
  "product-sidebar": "Product page — sidebar",
  "cart-page": "Cart page",
};

export const LINK_TYPE_LABELS: Record<BannerLinkType, string> = {
  none: "No link (display only)",
  product: "Product",
  category: "Category",
  collection: "Collection",
  external: "External URL",
};

export interface AdminBanner {
  id: string;
  name: string;
  imageUrl: string;
  altText: string;
  placement: BannerPlacement;
  linkType: BannerLinkType;
  linkValue: string;
  status: BannerStatus;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  updatedAt: string;
  /** False when the banner is active but outside its scheduled window — the table shows this so "Active but not showing" isn't a mystery. */
  isLiveNow: boolean;
}
