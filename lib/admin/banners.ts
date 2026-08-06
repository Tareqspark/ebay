import { cache } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { banners as bannersTable } from "@/db/schema";
import type { AdminBanner } from "@/lib/admin/banner-constants";

// Labels and types live in banner-constants.ts so client components can
// import them without pulling this module's db connection with them.
export * from "@/lib/admin/banner-constants";

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
