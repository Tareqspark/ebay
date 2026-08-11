"use server";

import { cookies } from "next/headers";
import { isSupportedCountry } from "@/lib/countries";

/**
 * The shopper's chosen shipping destination, remembered between visits.
 *
 * This is a *browsing* preference, not an address — it seeds the checkout
 * country so an overseas customer isn't silently defaulted to the US and
 * made to correct it at the last step. The real shipping country is still
 * whatever the address form submits; nothing here is trusted for pricing
 * or tax, which are recomputed server-side from the submitted address.
 */
const SHIP_TO_COOKIE = "cartebay_ship_to";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getShipToCountry(): Promise<string> {
  const stored = (await cookies()).get(SHIP_TO_COOKIE)?.value;
  // A hand-edited cookie is untrusted input: anything not on the shipping
  // list falls back to US rather than reaching a lookup as a bad code.
  return isSupportedCountry(stored) ? stored!.trim().toUpperCase() : "US";
}

export async function setShipToCountry(code: string): Promise<{ country: string }> {
  if (!isSupportedCountry(code)) {
    // Don't persist junk — report the unchanged value so the caller can
    // roll its optimistic update back.
    return { country: await getShipToCountry() };
  }

  const country = code.trim().toUpperCase();
  (await cookies()).set(SHIP_TO_COOKIE, country, {
    // Readable by JS on purpose: it's a display preference, not a
    // credential, and no security decision is made from it.
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return { country };
}
