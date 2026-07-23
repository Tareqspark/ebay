/**
 * The CJdropshipping API client boundary — same graceful-degradation shape
 * as lib/stripe.ts's getStripe()/isStripeConfigured(): returns null when
 * CJ_API_KEY isn't set (true today, since going live needs the business's
 * own CJ developer account — see PRODUCT.md's Open decisions), so every
 * caller already has to handle "not connected" rather than assuming a
 * live client. Wiring in a real account later is a change to this one
 * file — pushOrderToCjAction, resolveCjDisputeAction, and the sourcing
 * request flow all already call through here, not a hardcoded mock inline.
 */

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
  submitSourcingRequest(productName: string, referenceUrl: string | null, notes: string): Promise<{ cjRequestId: string }>;
}

/**
 * Returns null when CJ isn't configured — callers fall back to the local
 * mock (a plausible-looking ID, no real network call) exactly like
 * checkout already does when Stripe is unconfigured. When it *is*
 * configured, this is where the real fetch() calls against CJ's REST API
 * (api.cjdropshipping.com) would live; there's no real account to
 * verify that integration against yet, so it's deliberately not written
 * speculatively — better an honest null than unverifiable API-shape guesses.
 */
export function getCjClient(): CjClient | null {
  if (!isCjConfigured()) return null;
  throw new Error("CJ_API_KEY is set but no real CJ client is implemented yet — see lib/cj-provider.ts");
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
  referenceUrl: string | null,
  notes: string
): Promise<{ cjRequestId: string }> {
  const client = getCjClient();
  if (client) return client.submitSourcingRequest(productName, referenceUrl, notes);
  return { cjRequestId: mockId("CJR") };
}
