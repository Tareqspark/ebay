import "server-only";
import { db } from "@/db";
import { productViews } from "@/db/schema";
import { newId } from "@/lib/id";

/** Fire from the product detail page for signed-in shoppers only — feeds lib/personalization.ts's browsing-behavior signal. */
export async function recordProductView(userId: string, productId: string, categorySlug: string): Promise<void> {
  await db.insert(productViews).values({ id: newId(), userId, productId, categorySlug });
}
