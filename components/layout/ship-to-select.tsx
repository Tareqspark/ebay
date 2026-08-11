"use client";

import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { setShipToCountry } from "@/lib/ship-to";

/**
 * Destination picker in the top utility bar.
 *
 * A native <select> rather than the shadcn one, matching the country field
 * in the checkout form: it needs no popup positioning inside a sticky
 * header, and gets the OS picker on mobile for a 32-item list.
 */
export function ShipToSelect({ value }: { value: string }) {
  const [country, setCountry] = useState(value);
  const [isPending, startTransition] = useTransition();

  function change(next: string) {
    const previous = country;
    // Updated locally rather than by refreshing the server tree: the cookie
    // is only read on the next navigation (checkout's country prefill), so
    // a router.refresh() here would re-render a 2MB page to no effect.
    setCountry(next);

    // Guarded: useTransition only clears isPending once the async body
    // settles, so an unhandled throw would leave the control disabled for
    // good — the same failure that froze the cart and checkout buttons.
    startTransition(async () => {
      try {
        const result = await setShipToCountry(next);
        if (result.country !== next) setCountry(result.country);
      } catch {
        setCountry(previous);
      }
    });
  }

  return (
    <span className="hidden items-center gap-1.5 md:flex">
      <MapPin className="h-3.5 w-3.5 shrink-0" />
      <label htmlFor="ship-to" className="sr-only">
        Choose your shipping destination
      </label>
      <span aria-hidden="true">Ship to:</span>
      <select
        id="ship-to"
        value={country}
        disabled={isPending}
        onChange={(e) => change(e.target.value)}
        className="cursor-pointer rounded-sm bg-transparent py-0.5 font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-background/60 disabled:cursor-wait disabled:opacity-60"
      >
        {COUNTRIES.map((c) => (
          // The bar is dark but the native dropdown is painted by the OS,
          // so options carry page colours rather than inheriting these.
          <option key={c.code} value={c.code} className="bg-background text-foreground">
            {c.name}
          </option>
        ))}
      </select>
    </span>
  );
}
