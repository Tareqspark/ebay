import { cache } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { banners as bannersTable, bannerPlacement } from "@/db/schema";

export type BannerPlacement = (typeof bannerPlacement)[number];
export type BannerLinkType = (typeof bannersTable.$inferSelect)["linkType"];
export type BannerStatus = (typeof bannersTable.$inferSelect)["status"];

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

export const getBanners = cache(async (): Promise<AdminBanner[]> => {
  const rows = await db.select().from(bannersTable).orderBy(asc(bannersTable.placement), asc(bannersTable.sortOrder));
  const now = Date.now();

  return rows.map((b) => ({
    id: b.id,
    name: b.name,
    imageUrl: b.imageUrl,
    altText: b.altText,
    placement: b.placement,
    linkType: b.linkType,
    linkValue: b.linkValue ?? "",
    status: b.status,
    startsAt: b.startsAt?.toISOString() ?? null,
    endsAt: b.endsAt?.toISOString() ?? null,
    sortOrder: b.sortOrder,
    updatedAt: b.updatedAt.toISOString(),
    isLiveNow:
      b.status === "active" &&
      (b.startsAt == null || b.startsAt.getTime() <= now) &&
      (b.endsAt == null || b.endsAt.getTime() > now),
  }));
});
