import "server-only";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, productMeta, cjDisputes } from "@/db/schema";

/**
 * The CJdropshipping API client boundary — same graceful-degradation shape
 * as lib/stripe.ts's getStripe()/isStripeConfigured(): returns null when
 * CJ_API_KEY isn't set, so every caller already has to handle "not
 * connected" rather than assuming a live client.
 *
 * Real endpoints, from https://developers.cjdropshipping.com/ (CJ's Open
 * API, v1, api2.0):
 *   - authentication/getAccessToken: exchanges CJ_API_KEY for a bearer
 *     token, sent back as CJ-Access-Token on every subsequent call.
 *   - shopping/order/createOrderV3: pushes an order for fulfillment.
 *   - disputes/create: files an after-sales dispute against an order CJ
 *     already knows about.
 *   - product/sourcing/create: asks CJ to source a product not in their
 *     catalog.
 *
 * Two real limitations, not code gaps:
 *   1. createOrderV3 needs a real CJ variant id (`vid`) per line item.
 *      This project's catalog (scripts/generate-admin-data.mjs) generates
 *      product_meta.cj_variant_id as a random placeholder string, not a
 *      real CJ catalog identifier — so pushOrder is wired correctly but
 *      will be rejected by CJ's real API against any order in this
 *      database, until real products are sourced from CJ's actual catalog
 *      (see product/listV2 or product/query) and their real vids stored.
 *   2. disputes/create only accepts orders "created through the API" (per
 *      CJ's own docs) — same blocker, and disputes/create's response only
 *      returns a boolean, not a CJ-generated ticket id, so
 *      CjDisputeSubmissionResult.cjTicketId is our own businessDisputeId,
 *      not something CJ assigned.
 */

const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

interface CjEnvelope<T> {
  code: number;
  result: boolean;
  message: string;
  data: T;
  requestId: string;
}

export function isCjConfigured(): boolean {
  return Boolean(process.env.CJ_API_KEY);
}

export interface CjPushOrderResult {
  cjOrderId: string;
}

export interface CjDisputeSubmissionResult {
  cjTicketId: string;
}

interface CjClient {
  pushOrder(orderId: string): Promise<CjPushOrderResult>;
  submitDispute(disputeId: string, resolution: "reshipment" | "refund"): Promise<CjDisputeSubmissionResult>;
  submitSourcingRequest(productName: string, productImage: string, referenceUrl: string | null, notes: string): Promise<{ cjRequestId: string }>;
}

// Module-scope cache, not persisted across a dev-server restart (unlike
// db/index.ts's connection pool) — an access token is cheap to re-fetch
// (CJ's docs: repeated calls within 24h return the same token), so losing
// this on HMR reload just costs one extra round trip, not a resource leak.
let cachedToken: { accessToken: string; expiresAt: number; openId: number } | null = null;

async function fetchAccessToken(): Promise<NonNullable<typeof cachedToken>> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken;
  }

  const res = await fetch(`${CJ_BASE_URL}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
  });
  const body = (await res.json()) as CjEnvelope<{ accessToken: string; accessTokenExpiryDate: string; openId: number }>;
  if (!body.result) {
    throw new Error(`CJ authentication failed: ${body.message}`);
  }

  cachedToken = { accessToken: body.data.accessToken, expiresAt: new Date(body.data.accessTokenExpiryDate).getTime(), openId: body.data.openId };
  return cachedToken;
}

async function getAccessToken(): Promise<string> {
  return (await fetchAccessToken()).accessToken;
}

async function cjFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${CJ_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "CJ-Access-Token": accessToken },
    body: JSON.stringify(body),
  });
  const envelope = (await res.json()) as CjEnvelope<T>;
  if (!envelope.result) {
    throw new Error(`CJ API error at ${path}: ${envelope.message} (code ${envelope.code})`);
  }
  return envelope.data;
}

async function pushOrderReal(orderId: string): Promise<CjPushOrderResult> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const items = await db
    .select()
    .from(orderItems)
    .where(and(eq(orderItems.orderId, orderId), eq(orderItems.source, "cj")));
  if (items.length === 0) throw new Error(`Order ${orderId} has no CJ-sourced line items to push`);

  const metaRows = await db
    .select()
    .from(productMeta)
    .where(inArray(productMeta.productId, items.map((item) => item.productId)));
  const metaByProductId = new Map(metaRows.map((m) => [m.productId, m]));

  const address = order.shippingAddress;
  const data = await cjFetch<{ orderId: string }>("/shopping/order/createOrderV3", {
    orderNumber: order.orderNumber,
    shippingCountryCode: address.country,
    shippingCountry: address.country,
    shippingProvince: address.state,
    shippingCity: address.city,
    shippingZip: address.zip,
    shippingCustomerName: address.name,
    shippingAddress: address.line1,
    // Origin warehouse: takes the first item's, since createOrderV3 is one
    // origin per order — a real mixed-warehouse order would need splitting,
    // not handled here.
    fromCountryCode: metaByProductId.get(items[0].productId)?.cjSourceWarehouse ?? "CN",
    // No real freight-rate lookup wired in (see logistic.html's Freight
    // Calculation API) — this is a reasonable default CJ shipping method,
    // not derived from the actual destination/weight.
    logisticName: "CJPacket Ordinary",
    products: items.map((item) => ({
      vid: metaByProductId.get(item.productId)?.cjVariantId,
      quantity: item.quantity,
      storeLineItemId: item.id,
    })),
  });

  return { cjOrderId: data.orderId };
}

// The only disputeReasonId CJ's docs confirm is 1 ("Unfulfilled Order
// Cancellation"), which doesn't semantically match any of this project's 5
// internal reasons (lost_in_transit, damaged, wrong_item, not_as_described,
// defective) — there's no complete reason-code reference published. Used
// as a placeholder for every reason until a real mapping is available
// (check the dispute form in the CJ merchant dashboard, or CJ support).
const CJ_DISPUTE_REASON_ID_PLACEHOLDER = 1;

async function submitDisputeReal(disputeId: string, resolution: "reshipment" | "refund"): Promise<CjDisputeSubmissionResult> {
  const [dispute] = await db.select().from(cjDisputes).where(eq(cjDisputes.id, disputeId)).limit(1);
  if (!dispute) throw new Error(`Dispute ${disputeId} not found`);

  const [order] = await db.select({ cjOrderId: orders.cjOrderId }).from(orders).where(eq(orders.id, dispute.orderId)).limit(1);
  if (!order?.cjOrderId) {
    throw new Error(`Order ${dispute.orderId} has no CJ order id — it must be pushed to CJ (and accepted) before a dispute can be filed`);
  }

  const [orderItem] = await db
    .select({ quantity: orderItems.quantity })
    .from(orderItems)
    .where(and(eq(orderItems.orderId, dispute.orderId), eq(orderItems.productId, dispute.productId)))
    .limit(1);

  // disputes/create's response is just {data: true} on success — no
  // CJ-generated ticket id comes back, so our own businessDisputeId (this
  // dispute's row id) is the only reference we have to hand back.
  await cjFetch<boolean>("/disputes/create", {
    orderId: order.cjOrderId,
    businessDisputeId: dispute.id,
    disputeReasonId: CJ_DISPUTE_REASON_ID_PLACEHOLDER,
    expectType: resolution === "refund" ? 1 : 2,
    refundType: 1,
    messageText: `${dispute.reason.replace(/_/g, " ")}: ${dispute.productTitle}`,
    productInfoList: [{ quantity: orderItem?.quantity ?? 1, price: dispute.amountCents / 100 }],
  });

  return { cjTicketId: dispute.id };
}

async function submitSourcingRequestReal(
  productName: string,
  productImage: string,
  referenceUrl: string | null,
  notes: string
): Promise<{ cjRequestId: string }> {
  const data = await cjFetch<{ cjSourcingId: string }>("/product/sourcing/create", {
    productName,
    productImage,
    ...(referenceUrl ? { productUrl: referenceUrl } : {}),
    ...(notes ? { remark: notes } : {}),
  });
  return { cjRequestId: data.cjSourcingId };
}

/** Safe, side-effect-free connectivity check — just exchanges CJ_API_KEY for an access token, doesn't touch orders/disputes/sourcing. */
export async function verifyCjConnection(): Promise<{ ok: boolean; openId?: number; error?: string }> {
  if (!isCjConfigured()) return { ok: false, error: "CJ_API_KEY is not set" };
  try {
    const token = await fetchAccessToken();
    return { ok: true, openId: token.openId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function getCjClient(): CjClient | null {
  if (!isCjConfigured()) return null;
  return {
    pushOrder: pushOrderReal,
    submitDispute: submitDisputeReal,
    submitSourcingRequest: submitSourcingRequestReal,
  };
}

function mockId(prefix: string): string {
  return `${prefix}-${Math.floor(Math.random() * 9000000 + 1000000)}`;
}

/** Real order push if CJ is configured, otherwise the same local-only mock this project has always used. */
export async function pushOrderToCj(orderId: string): Promise<CjPushOrderResult> {
  const client = getCjClient();
  if (client) return client.pushOrder(orderId);
  return { cjOrderId: mockId("CJO") };
}

export async function submitCjDispute(disputeId: string, resolution: "reshipment" | "refund"): Promise<CjDisputeSubmissionResult> {
  const client = getCjClient();
  if (client) return client.submitDispute(disputeId, resolution);
  return { cjTicketId: mockId("CJT") };
}

export async function submitCjSourcingRequest(
  productName: string,
  productImage: string,
  referenceUrl: string | null,
  notes: string
): Promise<{ cjRequestId: string }> {
  const client = getCjClient();
  if (client) return client.submitSourcingRequest(productName, productImage, referenceUrl, notes);
  return { cjRequestId: mockId("CJR") };
}
