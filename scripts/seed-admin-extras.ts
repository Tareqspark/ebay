/**
 * Hand-curated mock data for admin entities that were never bulk/procedurally
 * generated (unlike products/orders/etc) — campaigns, CMS content,
 * collections, shipping config, staff team, API keys. Used only by
 * scripts/seed-db.ts to seed their one-time initial rows; the app itself
 * reads these back from the DB via lib/admin/{marketing,content,collections,
 * shipping,team,api-keys}.ts, not from this file.
 */

interface SeedCampaign {
  id: string;
  name: string;
  type: "discount" | "email" | "banner";
  status: "active" | "scheduled" | "ended" | "draft";
  channel: string;
  startDate: string;
  endDate?: string;
  code?: string;
  redemptions: number;
  revenueAttributed: number;
}

export const CAMPAIGNS: SeedCampaign[] = [
  { id: "camp-1", name: "Summer Flash Sale", type: "discount", status: "active", channel: "Site-wide banner", startDate: "2026-07-15T00:00:00Z", endDate: "2026-07-22T00:00:00Z", code: "SUMMER20", redemptions: 1842, revenueAttributed: 96420.5 },
  { id: "camp-2", name: "Welcome Series — New Subscribers", type: "email", status: "active", channel: "Email", startDate: "2026-01-01T00:00:00Z", redemptions: 6120, revenueAttributed: 184320.75 },
  { id: "camp-3", name: "Free Shipping Weekend", type: "banner", status: "ended", channel: "Homepage hero", startDate: "2026-06-27T00:00:00Z", endDate: "2026-06-29T00:00:00Z", redemptions: 2310, revenueAttributed: 58210.2 },
  { id: "camp-4", name: "Back to School 15% Off", type: "discount", status: "scheduled", channel: "Email + banner", startDate: "2026-08-10T00:00:00Z", endDate: "2026-08-24T00:00:00Z", code: "SCHOOL15", redemptions: 0, revenueAttributed: 0 },
  { id: "camp-5", name: "Abandoned Cart Recovery", type: "email", status: "active", channel: "Email", startDate: "2026-02-01T00:00:00Z", redemptions: 3840, revenueAttributed: 129600.4 },
  { id: "camp-6", name: "VIP Early Access", type: "email", status: "active", channel: "Email", startDate: "2026-05-01T00:00:00Z", redemptions: 940, revenueAttributed: 71230.9 },
  { id: "camp-7", name: "Clearance Category Banner", type: "banner", status: "active", channel: "Category page", startDate: "2026-07-01T00:00:00Z", redemptions: 1120, revenueAttributed: 21980.15 },
  { id: "camp-8", name: "Fall Preview 10% Off", type: "discount", status: "draft", channel: "Email", startDate: "2026-09-01T00:00:00Z", code: "FALL10", redemptions: 0, revenueAttributed: 0 },
  { id: "camp-9", name: "Win-Back — Lapsed Customers", type: "email", status: "active", channel: "Email", startDate: "2026-04-15T00:00:00Z", redemptions: 1560, revenueAttributed: 48720.6 },
  { id: "camp-10", name: "Holiday Countdown Banner", type: "banner", status: "scheduled", channel: "Homepage hero", startDate: "2026-11-20T00:00:00Z", endDate: "2026-12-25T00:00:00Z", redemptions: 0, revenueAttributed: 0 },
];

export const CONTENT_ITEMS = [
  { id: "cnt-1", title: "Electronics — Featured Collection", type: "hero_slide", location: "Homepage hero", status: "published", updatedAt: "2026-07-18T10:00:00Z" },
  { id: "cnt-2", title: "Computers & Tablets — Featured Collection", type: "hero_slide", location: "Homepage hero", status: "published", updatedAt: "2026-07-18T10:00:00Z" },
  { id: "cnt-3", title: "Free shipping over $50", type: "banner", location: "Top bar", status: "published", updatedAt: "2026-06-01T09:00:00Z" },
  { id: "cnt-4", title: "Flash Sale — ends tonight", type: "banner", location: "Homepage", status: "published", updatedAt: "2026-07-19T06:00:00Z" },
  { id: "cnt-5", title: "About Baruashop", type: "page", location: "/about", status: "published", updatedAt: "2026-03-12T09:00:00Z" },
  { id: "cnt-6", title: "Shipping & Delivery", type: "page", location: "/help/shipping", status: "published", updatedAt: "2026-04-02T09:00:00Z" },
  { id: "cnt-7", title: "Returns & Refunds", type: "page", location: "/help/returns", status: "published", updatedAt: "2026-04-02T09:00:00Z" },
  { id: "cnt-8", title: "Sustainability", type: "page", location: "/sustainability", status: "draft", updatedAt: "2026-06-20T09:00:00Z" },
  { id: "cnt-9", title: "Careers", type: "page", location: "/careers", status: "published", updatedAt: "2026-02-15T09:00:00Z" },
  { id: "cnt-10", title: "Back to School Banner", type: "banner", location: "Category pages", status: "draft", updatedAt: "2026-07-08T09:00:00Z" },
  { id: "cnt-11", title: "Holiday Countdown Hero", type: "hero_slide", location: "Homepage hero", status: "draft", updatedAt: "2026-06-28T09:00:00Z" },
  { id: "cnt-12", title: "Privacy Policy", type: "page", location: "/legal/privacy", status: "published", updatedAt: "2026-01-10T09:00:00Z" },
] as const;

interface SeedCollection {
  id: string;
  name: string;
  type: "manual" | "automated";
  ruleDescription?: string;
  status: "active" | "draft";
  updatedAt: string;
  imageSeed: string;
}

export const COLLECTIONS: SeedCollection[] = [
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

export const SHIPPING_RATES = [
  { id: "rate-1", zone: "Continental US", method: "Standard Shipping", condition: "Orders under $50", rate: 5.99, deliveryEstimate: "4–6 business days", status: "active" },
  { id: "rate-2", zone: "Continental US", method: "Standard Shipping", condition: "Orders $50+", rate: 0, deliveryEstimate: "4–6 business days", status: "active" },
  { id: "rate-3", zone: "Continental US", method: "Expedited Shipping", condition: "All orders", rate: 14.99, deliveryEstimate: "2–3 business days", status: "active" },
  { id: "rate-4", zone: "Continental US", method: "Overnight Shipping", condition: "All orders", rate: 29.99, deliveryEstimate: "1 business day", status: "active" },
  { id: "rate-5", zone: "Alaska & Hawaii", method: "Standard Shipping", condition: "All orders", rate: 12.99, deliveryEstimate: "6–10 business days", status: "active" },
  { id: "rate-6", zone: "Alaska & Hawaii", method: "Expedited Shipping", condition: "All orders", rate: 24.99, deliveryEstimate: "3–5 business days", status: "active" },
  { id: "rate-7", zone: "US Territories", method: "Standard Shipping", condition: "All orders", rate: 16.99, deliveryEstimate: "8–12 business days", status: "active" },
  { id: "rate-8", zone: "APO/FPO Military", method: "Standard Shipping", condition: "All orders", rate: 9.99, deliveryEstimate: "Varies by destination", status: "disabled" },
] as const;

export const CARRIERS = [
  { id: "carrier-1", name: "USPS", connected: true, servicesUsed: ["Ground Advantage", "Priority Mail"] },
  { id: "carrier-2", name: "UPS", connected: true, servicesUsed: ["Ground", "2nd Day Air", "Next Day Air"] },
  { id: "carrier-3", name: "FedEx", connected: true, servicesUsed: ["Home Delivery", "Express Saver"] },
  { id: "carrier-4", name: "DHL Express", connected: false, servicesUsed: [] as string[] },
] as const;

export const ADMIN_TEAM = [
  { id: "u-1", name: "Priya Patel", email: "priya@baruashop.com", role: "Owner", status: "active", lastActiveAt: "2026-07-19T13:00:00Z" },
  { id: "u-2", name: "Marcus Chen", email: "marcus@baruashop.com", role: "Admin", status: "active", lastActiveAt: "2026-07-19T10:30:00Z" },
  { id: "u-3", name: "Sofia Ricci", email: "sofia@baruashop.com", role: "Merchandiser", status: "active", lastActiveAt: "2026-07-18T16:45:00Z" },
  { id: "u-4", name: "Daniel Osei", email: "daniel@baruashop.com", role: "Catalog Manager", status: "active", lastActiveAt: "2026-07-19T08:15:00Z" },
  { id: "u-5", name: "Grace Kim", email: "grace@baruashop.com", role: "Support", status: "active", lastActiveAt: "2026-07-19T11:20:00Z" },
  { id: "u-6", name: "Elena Vargas", email: "elena@baruashop.com", role: "Support", status: "invited", lastActiveAt: "2026-07-17T09:00:00Z" },
] as const;

export const API_KEYS = [
  { id: "key-1", name: "Storefront (production)", prefix: "bsk_live_4f2a", scopes: ["read:products", "read:categories"], createdAt: "2026-02-01T09:00:00Z", lastUsedAt: "2026-07-19T13:00:00Z" },
  { id: "key-2", name: "Supplier sync service", prefix: "bsk_live_91c7", scopes: ["write:products", "write:inventory"], createdAt: "2026-01-15T09:00:00Z", lastUsedAt: "2026-07-19T12:40:00Z" },
  { id: "key-3", name: "Analytics export (staging)", prefix: "bsk_test_2e88", scopes: ["read:orders", "read:analytics"], createdAt: "2026-05-10T09:00:00Z", lastUsedAt: "2026-06-30T08:00:00Z" },
] as const;
