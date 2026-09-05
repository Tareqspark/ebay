import { ArrowRight } from "lucide-react";
import type { FieldChange } from "@/lib/admin/types";

/**
 * The before and after of an edit.
 *
 * Written for the question this exists to answer — "what did staff change on
 * this product?" — so both sides are always shown. A log line that says only
 * "title changed" forces a guess about what it used to be, which was the whole
 * complaint that prompted this.
 *
 * Deliberately has no hooks, so the audit log page can render it on the server
 * and the product detail panel can render the same component on the client.
 */

/** Field keys are already readable ("title", "category"); this just presents them. */
function label(field: string): string {
  return field.charAt(0).toUpperCase() + field.slice(1);
}

/** An absent value is not the empty string — say which it is rather than render a blank. */
function Value({ value, kind }: { value: string | null; kind: "from" | "to" }) {
  if (value === null || value === "") {
    return (
      <span className="italic text-muted-foreground/70">
        {kind === "from" ? "empty" : "removed"}
      </span>
    );
  }
  return <span className="break-words">{value}</span>;
}

export function FieldChanges({
  changes,
  className = "",
}: {
  changes: Record<string, FieldChange>;
  className?: string;
}) {
  const entries = Object.entries(changes);
  if (entries.length === 0) return null;

  return (
    <dl className={`flex flex-col gap-1.5 ${className}`}>
      {entries.map(([field, { from, to }]) => (
        <div key={field} className="grid grid-cols-[5.5rem_1fr] items-start gap-x-2 gap-y-0.5 text-xs">
          <dt className="pt-0.5 font-medium text-muted-foreground">{label(field)}</dt>
          <dd className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-1.5">
            <span className="min-w-0 rounded bg-destructive/10 px-1.5 py-0.5 text-destructive line-through decoration-destructive/40">
              <Value value={from} kind="from" />
            </span>
            <ArrowRight className="mt-0.5 hidden h-3 w-3 shrink-0 text-muted-foreground/60 sm:block" aria-hidden />
            <span className="min-w-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400">
              <Value value={to} kind="to" />
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
