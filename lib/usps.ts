import "server-only";

/**
 * Live USPS rate quoting, domestic and international.
 *
 * Uses the current developer.usps.com APIs — OAuth 2.0 client credentials
 * against apis.usps.com. The legacy Web Tools XML endpoints were retired on
 * 25 January 2026 and are not an option.
 *
 * Two properties matter more than the quoting itself:
 *
 *   1. It never throws into checkout. Every entry point returns null on any
 *      failure, so the caller falls back to the configured rate table. A
 *      shipping quote must not be able to stop someone paying.
 *   2. It caches hard. The default app quota is 60 calls an hour, which
 *      moderate checkout traffic would burn through in minutes. A rate is a
 *      pure function of origin, destination, weight and dimensions, so an
 *      identical parcel to an identical address is answered from memory.
 */

const TOKEN_URL = "https://apis.usps.com/oauth2/v3/token";
const DOMESTIC_URL = "https://apis.usps.com/prices/v3/base-rates/search";
const INTERNATIONAL_URL = "https://apis.usps.com/international-prices/v3/base-rates/search";

/** Where self-fulfilled parcels ship from. */
export const ORIGIN_ZIP = process.env.USPS_ORIGIN_ZIP ?? "90813";

/**
 * Domestic services offered at checkout, cheapest first. Ground Advantage is
 * the workhorse for parcels; Priority is the upgrade. Deliberately a short
 * list — every extra class is another API call against a 60/hour budget.
 */
const DOMESTIC_CLASSES = [
  { mailClass: "USPS_GROUND_ADVANTAGE", label: "USPS Ground Advantage", estimate: "2–5 business days" },
  { mailClass: "PRIORITY_MAIL", label: "USPS Priority Mail", estimate: "1–3 business days" },
] as const;

const INTERNATIONAL_CLASSES = [
  { mailClass: "PRIORITY_MAIL_INTERNATIONAL", label: "USPS Priority Mail International", estimate: "6–10 business days" },
] as const;

export interface UspsQuote {
  mailClass: string;
  label: string;
  price: number;
  estimate: string;
}

export function isUspsConfigured(): boolean {
  return Boolean(process.env.USPS_CONSUMER_KEY && process.env.USPS_CONSUMER_SECRET);
}

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------

let token: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  if (token && token.expiresAt > Date.now()) return token.value;
  if (!isUspsConfigured()) return null;

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.USPS_CONSUMER_KEY!,
        client_secret: process.env.USPS_CONSUMER_SECRET!,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.access_token) {
      console.error("[usps] token exchange failed", res.status, body.error ?? "");
      return null;
    }
    // Tokens last ~8 hours; renewed two minutes early.
    token = { value: body.access_token, expiresAt: Date.now() + Math.max(0, (Number(body.expires_in) || 28800) - 120) * 1000 };
    return token.value;
  } catch (err) {
    console.error("[usps] token exchange error", (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { quotes: UspsQuote[]; expiresAt: number }>();

function readCache(key: string): UspsQuote[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.quotes;
}

function writeCache(key: string, quotes: UspsQuote[]): void {
  // Bounded so a long-lived process can't accumulate every ZIP ever quoted.
  if (cache.size > 5_000) cache.clear();
  cache.set(key, { quotes, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// Quoting
// ---------------------------------------------------------------------------

export interface QuoteRequest {
  /** Total parcel weight in pounds — USPS prices in pounds, not ounces. */
  weightLb: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  destinationZip?: string;
  destinationCountry: string;
  destinationPostalCode?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function postRate(url: string, token: string, payload: Record<string, unknown>): Promise<number | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Short: this runs while a customer waits on the checkout form.
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) {
      // 429 is the hourly quota. Logged rather than surfaced — the caller
      // falls back to the rate table and the customer sees a price either way.
      if (res.status !== 429) console.error("[usps] rate request failed", res.status, url);
      else console.warn("[usps] hourly quota exhausted — falling back to the rate table");
      return null;
    }
    const body = await res.json().catch(() => ({}));
    const price = body?.rates?.[0]?.price ?? body?.totalBasePrice;
    return typeof price === "number" && price > 0 ? price : null;
  } catch {
    return null;
  }
}

/**
 * Quotes a parcel. Returns an empty array when USPS can't answer — callers
 * treat that as "no USPS options", not as an error.
 */
export async function quoteUsps(req: QuoteRequest): Promise<UspsQuote[]> {
  if (!isUspsConfigured()) return [];
  if (req.weightLb <= 0) return [];

  const isDomestic = req.destinationCountry.trim().toUpperCase() === "US";
  const destination = isDomestic ? req.destinationZip : `${req.destinationCountry}/${req.destinationPostalCode ?? ""}`;
  if (isDomestic && !req.destinationZip) return [];

  const key = [
    ORIGIN_ZIP,
    destination,
    req.weightLb.toFixed(2),
    req.lengthIn,
    req.widthIn,
    req.heightIn,
  ].join("|");

  const cached = readCache(key);
  if (cached) return cached;

  const bearer = await getToken();
  if (!bearer) return [];

  const base = {
    originZIPCode: ORIGIN_ZIP,
    weight: Number(req.weightLb.toFixed(2)),
    length: req.lengthIn,
    width: req.widthIn,
    height: req.heightIn,
    processingCategory: "MACHINABLE",
    rateIndicator: "SP",
    destinationEntryFacilityType: "NONE",
    priceType: "RETAIL",
    mailingDate: today(),
  };

  const classes = isDomestic ? DOMESTIC_CLASSES : INTERNATIONAL_CLASSES;
  const url = isDomestic ? DOMESTIC_URL : INTERNATIONAL_URL;

  const quotes: UspsQuote[] = [];
  for (const service of classes) {
    const payload = isDomestic
      ? { ...base, destinationZIPCode: req.destinationZip, mailClass: service.mailClass }
      : {
          ...base,
          destinationCountryCode: req.destinationCountry.trim().toUpperCase(),
          foreignPostalCode: req.destinationPostalCode || "",
          mailClass: service.mailClass,
        };

    const price = await postRate(url, bearer, payload);
    if (price != null) quotes.push({ mailClass: service.mailClass, label: service.label, price, estimate: service.estimate });
  }

  // Cached even when empty is deliberate — a destination USPS won't serve
  // shouldn't be re-asked on every keystroke of the checkout form.
  writeCache(key, quotes);
  return quotes;
}
