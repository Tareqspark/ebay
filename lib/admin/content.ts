export type ContentType = "page" | "banner" | "hero_slide";
export type ContentStatus = "published" | "draft";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  location: string;
  status: ContentStatus;
  updatedAt: string;
}

// Hand-curated CMS content — not bulk catalog data.
export const CONTENT_ITEMS: ContentItem[] = [
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
];
