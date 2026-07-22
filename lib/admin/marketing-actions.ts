"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { campaigns } from "@/db/schema";
import { newId } from "@/lib/id";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { checkPlainText } from "@/lib/sanitize";
import type { CampaignType, CampaignStatus } from "@/lib/admin/marketing";

export interface MarketingActionResult {
  error?: string;
}

export interface CampaignInput {
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  channel: string;
  startDate: string;
  endDate: string;
  code: string;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createCampaignAction(input: CampaignInput): Promise<MarketingActionResult> {
  const name = input.name.trim();
  const channel = input.channel.trim();
  if (!name) return { error: "Name is required" };
  if (!channel) return { error: "Channel is required" };
  const textError = checkPlainText(name, "Name") ?? checkPlainText(channel, "Channel") ?? checkPlainText(input.code, "Code");
  if (textError) return { error: textError };
  const startDate = parseDate(input.startDate);
  if (!startDate) return { error: "A valid start date is required" };
  const endDate = parseDate(input.endDate);
  if (endDate && endDate < startDate) return { error: "End date can't be before the start date" };

  await db.insert(campaigns).values({
    id: newId(),
    name,
    type: input.type,
    status: input.status,
    channel,
    startDate,
    endDate,
    code: input.code.trim() || null,
    redemptions: 0,
    revenueAttributedCents: 0,
  });

  const actor = await getAdminActorName();
  await logActivity("system", `Campaign "${name}" created`, actor);
  revalidatePath("/admin/marketing");
  return {};
}

export async function updateCampaignAction(id: string, input: CampaignInput): Promise<MarketingActionResult> {
  const name = input.name.trim();
  const channel = input.channel.trim();
  if (!name) return { error: "Name is required" };
  if (!channel) return { error: "Channel is required" };
  const textError = checkPlainText(name, "Name") ?? checkPlainText(channel, "Channel") ?? checkPlainText(input.code, "Code");
  if (textError) return { error: textError };
  const startDate = parseDate(input.startDate);
  if (!startDate) return { error: "A valid start date is required" };
  const endDate = parseDate(input.endDate);
  if (endDate && endDate < startDate) return { error: "End date can't be before the start date" };

  await db
    .update(campaigns)
    .set({
      name,
      type: input.type,
      status: input.status,
      channel,
      startDate,
      endDate,
      code: input.code.trim() || null,
    })
    .where(eq(campaigns.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Campaign "${name}" updated`, actor);
  revalidatePath("/admin/marketing");
  return {};
}

export async function deleteCampaignAction(id: string, name: string): Promise<MarketingActionResult> {
  await db.delete(campaigns).where(eq(campaigns.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Campaign "${name}" deleted`, actor);
  revalidatePath("/admin/marketing");
  return {};
}
