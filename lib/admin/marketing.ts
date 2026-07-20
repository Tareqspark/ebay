export type CampaignType = "discount" | "email" | "banner";
export type CampaignStatus = "active" | "scheduled" | "ended" | "draft";

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  channel: string;
  startDate: string;
  endDate?: string;
  code?: string;
  redemptions: number;
  revenueAttributed: number;
}

// Hand-curated marketing calendar — not bulk catalog data, so not
// procedurally generated like products/orders.
export const CAMPAIGNS: Campaign[] = [
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
