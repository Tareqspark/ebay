"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";

export interface HomepageDealsActionResult {
  error?: string;
}

function revalidateHomepageDealViews() {
  revalidatePath("/admin/marketing/homepage-deals");
  revalidatePath("/", "layout");
}

/** Replaces the full set of products flagged isFeaturedDeal — clears the old set first so removed products stop showing on the homepage rail. */
export async function setFeaturedDealsAction(productIds: string[]): Promise<HomepageDealsActionResult> {
  const guard = await requirePermission("marketing");
  if (guard) return guard;

  await db.update(products).set({ isFeaturedDeal: false }).where(eq(products.isFeaturedDeal, true));
  if (productIds.length > 0) {
    await db.update(products).set({ isFeaturedDeal: true }).where(inArray(products.id, productIds));
  }

  const actor = await getAdminActorName();
  await logActivity("product", `Featured Deals updated (${productIds.length} product${productIds.length === 1 ? "" : "s"})`, actor);
  revalidateHomepageDealViews();
  return {};
}

/** Replaces the full set of products flagged isWeeklyTopDeal — clears the old set first so removed products stop showing on the homepage rail. */
export async function setWeeklyTopDealsAction(productIds: string[]): Promise<HomepageDealsActionResult> {
  const guard = await requirePermission("marketing");
  if (guard) return guard;

  await db.update(products).set({ isWeeklyTopDeal: false }).where(eq(products.isWeeklyTopDeal, true));
  if (productIds.length > 0) {
    await db.update(products).set({ isWeeklyTopDeal: true }).where(inArray(products.id, productIds));
  }

  const actor = await getAdminActorName();
  await logActivity("product", `This Week's Top Deals updated (${productIds.length} product${productIds.length === 1 ? "" : "s"})`, actor);
  revalidateHomepageDealViews();
  return {};
}
