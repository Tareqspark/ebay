import { cache } from "react";
import { db } from "@/db";
import { shippingRates as shippingRatesTable, carriers as carriersTable } from "@/db/schema";
import { toDollars } from "@/lib/money";

export type ShippingRateStatus = "active" | "disabled";

export interface ShippingRate {
  id: string;
  zone: string;
  method: string;
  condition: string;
  rate: number;
  deliveryEstimate: string;
  status: ShippingRateStatus;
}

export interface Carrier {
  id: string;
  name: string;
  connected: boolean;
  servicesUsed: string[];
}

export const getShippingRates = cache(async (): Promise<ShippingRate[]> => {
  const rows = await db.select().from(shippingRatesTable);
  return rows.map((r) => ({
    id: r.id,
    zone: r.zone,
    method: r.method,
    condition: r.condition,
    rate: toDollars(r.rateCents),
    deliveryEstimate: r.deliveryEstimate,
    status: r.status,
  }));
});

export const getCarriers = cache(async (): Promise<Carrier[]> => {
  const rows = await db.select().from(carriersTable);
  return rows.map((c) => ({ id: c.id, name: c.name, connected: c.connected, servicesUsed: c.servicesUsed }));
});
