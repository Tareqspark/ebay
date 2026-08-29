import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

interface VariantSelectorProps {
  current: Product;
  siblings: Product[];
}

/**
 * Chooses between the colours and sizes a product comes in.
 *
 * Every variant keeps its own page, so this is a set of links rather than
 * client state: no JavaScript to pick an option, each colour stays separately
 * indexable, and add-to-cart needs no notion of variants because the page you
 * are on already is the one you would buy.
 *
 * Out-of-stock options stay visible but unclickable — knowing a colour exists
 * and has sold out is more useful than it silently disappearing.
 */
export function VariantSelector({ current, siblings }: VariantSelectorProps) {
  if (siblings.length < 2) return null;

  const prices = siblings.map((s) => s.price);
  const spread = Math.min(...prices) !== Math.max(...prices);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          Options
          <span className="ml-1.5 font-normal text-muted-foreground">({siblings.length})</span>
        </h2>
        {spread && (
          <span className="text-xs text-muted-foreground">
            {formatPrice(Math.min(...prices))} – {formatPrice(Math.max(...prices))}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {siblings.map((v, i) => {
          const isCurrent = v.id === current.id;
          const soldOut = v.stock <= 0;
          // Falls back to a position when the supplier gave the variants no
          // distinguishing name — rare, but a blank chip would be unusable.
          const label = v.variantLabel ?? `Option ${i + 1}`;

          const chip = cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            isCurrent
              ? "border-primary bg-primary/10 font-medium text-primary"
              : soldOut
                ? "border-border/70 text-muted-foreground/60 line-through"
                : "border-border text-foreground hover:border-primary hover:text-primary"
          );

          if (soldOut && !isCurrent) {
            return (
              <span key={v.id} className={chip} aria-disabled="true" title="Out of stock">
                {label}
              </span>
            );
          }

          return (
            <Link
              key={v.id}
              href={`/product/${v.slug}`}
              aria-current={isCurrent ? "true" : undefined}
              className={chip}
              // A shopper switching option wants the same place on the page,
              // not to be thrown back to the top.
              scroll={false}
            >
              {label}
              {spread && !isCurrent && (
                <span className="ml-1.5 text-xs text-muted-foreground">{formatPrice(v.price)}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
