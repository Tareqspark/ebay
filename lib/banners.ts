import "server-only";
import { and, asc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { banners as bannersTable } from "@/db/schema";

export type BannerPlacement = (typeof bannersTable.$inferSelect)["placement"];

export interface StorefrontBanner {
  id: string;
  imageUrl: string;
  altText: string;
  /** Already resolved to a real destination — null for a display-only banner. */
  href: string | null;
  /** External links leave the site, so the renderer opens them in a new tab with rel="noopener". */
  isExternal: boolean;
}

type BannerRow = typeof bannersTable.$inferSelect;

function resolveHref(row: BannerRow): { href: string | null; isExternal: boolean } {
  const value = row.linkValue?.trim();
  if (!value || row.linkType === "none") return { href: null, isExternal: false };

  switch (row.linkType) {
    case "product":
      return { href: `/product/${value}`, isExternal: false };
    case "category":
      return { href: `/category/${value}`, isExternal: false };
    case "collection":
      return { href: `/collection/${value}`, isExternal: false };
    case "external":
      return { href: value, isExternal: !value.startsWith("/") };
    default:
      return { href: null, isExternal: false };
  }
}

/**
 * The one banner to show in a slot right now: active, inside its scheduled
 * window (an unset start or end means "no bound on that side"), lowest
 * sortOrder wins. Returns null when the slot is empty, which is the normal
 * case for most slots — BannerSlot renders nothing rather than reserving
 * blank space.
 */
export async function getBannerForPlacement(placement: BannerPlacement): Promise<StorefrontBanner | null> {
  const now = new Date();
  const [row] = await db
    .select()
    .from(bannersTable)
    .where(
      and(
        eq(bannersTable.placement, placement),
        eq(bannersTable.status, "active"),
        or(isNull(bannersTable.startsAt), lte(bannersTable.startsAt, now)),
        or(isNull(bannersTable.endsAt), gt(bannersTable.endsAt, now))
      )
    )
    .orderBy(asc(bannersTable.sortOrder))
    .limit(1);

  if (!row) return null;
  const { href, isExternal } = resolveHref(row);
  return { id: row.id, imageUrl: row.imageUrl, altText: row.altText, href, isExternal };
}
