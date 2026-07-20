import { PRODUCTS } from "@/lib/admin/data";

export type CollectionType = "manual" | "automated";
export type CollectionStatus = "active" | "draft";

export interface Collection {
  id: string;
  name: string;
  type: CollectionType;
  ruleDescription?: string;
  status: CollectionStatus;
  updatedAt: string;
  imageSeed: string;
}

// Hand-curated — collections are a merchandising concept, not bulk catalog
// data, so unlike products/orders/etc these aren't procedurally generated.
export const COLLECTIONS: Collection[] = [
  { id: "col-1", name: "Today's Deals", type: "automated", ruleDescription: "isDeal = true", status: "active", updatedAt: "2026-07-19T08:00:00Z", imageSeed: "todays-deals" },
  { id: "col-2", name: "Flash Sale", type: "automated", ruleDescription: "isFlashSale = true", status: "active", updatedAt: "2026-07-19T06:00:00Z", imageSeed: "flash-sale" },
  { id: "col-3", name: "New Arrivals", type: "automated", ruleDescription: "isNewArrival = true", status: "active", updatedAt: "2026-07-18T14:00:00Z", imageSeed: "new-arrivals" },
  { id: "col-4", name: "Best Sellers", type: "automated", ruleDescription: "isBestSeller = true", status: "active", updatedAt: "2026-07-18T09:00:00Z", imageSeed: "best-sellers" },
  { id: "col-5", name: "Under $25", type: "automated", ruleDescription: "price < 25", status: "active", updatedAt: "2026-07-17T11:00:00Z", imageSeed: "under-25" },
  { id: "col-6", name: "Home Office Essentials", type: "manual", status: "active", updatedAt: "2026-07-15T10:00:00Z", imageSeed: "home-office" },
  { id: "col-7", name: "Summer Outdoor Living", type: "manual", status: "active", updatedAt: "2026-07-10T10:00:00Z", imageSeed: "summer-outdoor" },
  { id: "col-8", name: "Back to School", type: "manual", status: "draft", updatedAt: "2026-07-08T10:00:00Z", imageSeed: "back-to-school" },
  { id: "col-9", name: "Fitness Starter Kit", type: "manual", status: "active", updatedAt: "2026-07-05T10:00:00Z", imageSeed: "fitness-starter" },
  { id: "col-10", name: "Holiday Gift Guide", type: "manual", status: "draft", updatedAt: "2026-06-28T10:00:00Z", imageSeed: "holiday-gift" },
  { id: "col-11", name: "Premium Electronics", type: "automated", ruleDescription: "category = electronics AND price > 500", status: "active", updatedAt: "2026-06-20T10:00:00Z", imageSeed: "premium-electronics" },
  { id: "col-12", name: "Pet Parent Favorites", type: "manual", status: "active", updatedAt: "2026-06-12T10:00:00Z", imageSeed: "pet-favorites" },
];

export function getCollectionProductCount(collection: Collection): number {
  // Deterministic pseudo-count derived from the catalog so it stays stable
  // without wiring each collection to real membership data.
  let hash = 0;
  for (const ch of collection.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return 20 + (hash % Math.min(400, PRODUCTS.length - 20));
}
