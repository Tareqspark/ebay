import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "Shipping Settings" };

/**
 * A signpost, not a settings form.
 *
 * This page used to show four inputs — handling time, free shipping
 * threshold, a signature requirement and a tracking-email toggle — none of
 * which were wired to anything, above a Save button that reported success
 * regardless. The free-shipping threshold was the actively harmful one: it
 * looked like the control for a number that is really set per country on
 * the Shipping screen, so editing it here would have appeared to work and
 * changed nothing.
 *
 * Everything shipping-related that is real is linked below. Controls come
 * back here only once they persist something.
 */
const DESTINATIONS = [
  {
    href: "/admin/shipping",
    title: "Rates & zones",
    body: "Per-zone carrier rates, their order-value thresholds, and which are active.",
  },
  {
    href: "/admin/shipping",
    title: "Free shipping by country",
    body: "The real free-shipping control: on or off, the threshold, and the flat rate charged below it, per destination.",
  },
  {
    href: "/admin/shipping",
    title: "Carriers",
    body: "Connected carriers and the services used for fulfilment.",
  },
];

export default function AdminShippingSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <section className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Shipping is configured under Shipping</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Rates, zones, carriers and per-country free shipping all live on one screen.
          </p>
        </div>
        <div className="flex flex-col divide-y divide-border/60">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.title}
              href={d.href}
              className="group flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground group-hover:underline">{d.title}</span>
                <span className="text-xs text-muted-foreground">{d.body}</span>
              </span>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
        Handling time, signature-on-delivery and automatic tracking emails aren&apos;t configurable yet. They were
        listed here as inputs that saved nothing, which was worse than not offering them — they&apos;ll return once
        they do something.
      </p>
    </div>
  );
}
