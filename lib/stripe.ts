import "server-only";
import Stripe from "stripe";

let client: Stripe | null | undefined;

/** Returns null (not a throw) when STRIPE_SECRET_KEY isn't set yet — callers decide how to degrade. */
export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  client = key ? new Stripe(key) : null;
  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
