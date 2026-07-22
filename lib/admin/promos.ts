import { cache } from "react";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { promoCodes as promoCodesTable, promoRedemptions as promoRedemptionsTable } from "@/db/schema";
import { toDollars } from "@/lib/money";

export type PromoDiscountType = "percent" | "fixed" | "free_shipping";
export type PromoCodeStatus = "active" | "disabled";

export interface PromoCode {
  id: string;
  code: string;
  discountType: PromoDiscountType;
  discountPercent?: number;
  discountAmount?: number;
  usageLimit?: number;
  minOrderAmount?: number;
  status: PromoCodeStatus;
  startDate: string;
  endDate?: string;
  usageCount: number;
  createdAt: string;
}

export const getPromoCodes = cache(async (): Promise<PromoCode[]> => {
  const rows = await db.select().from(promoCodesTable).orderBy(desc(promoCodesTable.createdAt));
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    discountType: r.discountType,
    discountPercent: r.discountPercent ?? undefined,
    discountAmount: r.discountAmountCents != null ? toDollars(r.discountAmountCents) : undefined,
    usageLimit: r.usageLimit ?? undefined,
    minOrderAmount: r.minOrderAmountCents != null ? toDollars(r.minOrderAmountCents) : undefined,
    status: r.status,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate ? r.endDate.toISOString() : undefined,
    usageCount: r.usageCount,
    createdAt: r.createdAt.toISOString(),
  }));
});

export const getPromoStats = cache(async (): Promise<{ totalDiscountGiven: number }> => {
  const [row] = await db
    .select({ total: sql<string>`COALESCE(SUM(${promoRedemptionsTable.discountCents}), 0)` })
    .from(promoRedemptionsTable);
  return { totalDiscountGiven: toDollars(Number(row?.total ?? 0)) };
});
