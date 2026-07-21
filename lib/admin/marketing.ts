import { cache } from "react";
import { db } from "@/db";
import { campaigns as campaignsTable } from "@/db/schema";
import { toDollars } from "@/lib/money";

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

export const getCampaigns = cache(async (): Promise<Campaign[]> => {
  const rows = await db.select().from(campaignsTable);
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    status: c.status,
    channel: c.channel,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate ? c.endDate.toISOString() : undefined,
    code: c.code ?? undefined,
    redemptions: c.redemptions,
    revenueAttributed: toDollars(c.revenueAttributedCents),
  }));
});
