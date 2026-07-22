"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { promoCodes } from "@/db/schema";
import { newId } from "@/lib/id";
import { toCents } from "@/lib/money";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import type { PromoDiscountType, PromoCodeStatus } from "@/lib/admin/promos";

export interface PromoActionResult {
  error?: string;
}

export interface PromoCodeInput {
  code: string;
  discountType: PromoDiscountType;
  discountPercent?: number;
  discountAmount?: number;
  singleUse: boolean;
  status: PromoCodeStatus;
  startDate: string;
  endDate: string;
}

const CODE_PATTERN = /^[A-Z0-9_-]{3,40}$/;

function validateInput(input: PromoCodeInput): string | null {
  const code = input.code.trim().toUpperCase();
  if (!CODE_PATTERN.test(code)) {
    return "Code must be 3-40 characters: letters, numbers, hyphens, or underscores only";
  }
  if (input.discountType === "percent" && (!input.discountPercent || input.discountPercent < 1 || input.discountPercent > 100)) {
    return "Percent discount must be between 1 and 100";
  }
  if (input.discountType === "fixed" && (!input.discountAmount || input.discountAmount <= 0)) {
    return "Fixed discount amount must be greater than $0";
  }
  if (!input.startDate) return "A start date is required";
  if (input.endDate && new Date(input.endDate) < new Date(input.startDate)) {
    return "End date can't be before the start date";
  }
  return null;
}

export async function createPromoCodeAction(input: PromoCodeInput): Promise<PromoActionResult> {
  const error = validateInput(input);
  if (error) return { error };
  const code = input.code.trim().toUpperCase();

  const [existing] = await db.select({ id: promoCodes.id }).from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
  if (existing) return { error: "A promo code with this code already exists" };

  await db.insert(promoCodes).values({
    id: newId(),
    code,
    discountType: input.discountType,
    discountPercent: input.discountType === "percent" ? input.discountPercent! : null,
    discountAmountCents: input.discountType === "fixed" ? toCents(input.discountAmount!) : null,
    singleUse: input.singleUse,
    status: input.status,
    startDate: new Date(input.startDate),
    endDate: input.endDate ? new Date(input.endDate) : null,
  });

  const actor = await getAdminActorName();
  await logActivity("system", `Promo code "${code}" created`, actor);
  revalidatePath("/admin/promo-codes");
  return {};
}

export async function updatePromoCodeAction(id: string, input: PromoCodeInput): Promise<PromoActionResult> {
  const error = validateInput(input);
  if (error) return { error };
  const code = input.code.trim().toUpperCase();

  const [existing] = await db.select({ id: promoCodes.id }).from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
  if (existing && existing.id !== id) return { error: "A promo code with this code already exists" };

  await db
    .update(promoCodes)
    .set({
      code,
      discountType: input.discountType,
      discountPercent: input.discountType === "percent" ? input.discountPercent! : null,
      discountAmountCents: input.discountType === "fixed" ? toCents(input.discountAmount!) : null,
      singleUse: input.singleUse,
      status: input.status,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
    })
    .where(eq(promoCodes.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Promo code "${code}" updated`, actor);
  revalidatePath("/admin/promo-codes");
  return {};
}

export async function deletePromoCodeAction(id: string, code: string): Promise<PromoActionResult> {
  await db.delete(promoCodes).where(eq(promoCodes.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Promo code "${code}" deleted`, actor);
  revalidatePath("/admin/promo-codes");
  return {};
}
