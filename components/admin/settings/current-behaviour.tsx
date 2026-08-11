import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CircleAlert, CircleCheck, CircleMinus } from "lucide-react";

/**
 * Read-only "what actually happens today" panel.
 *
 * The settings screens used to render editable controls for behaviour
 * nothing could change, and several stated things that were simply untrue —
 * a per-state tax table when one flat rate is charged, shipping and
 * abandoned-cart emails that are never sent, a 2FA requirement that doesn't
 * exist. An owner reading those would have believed the store worked in a
 * way it doesn't.
 *
 * Until a setting is genuinely editable, showing the real value and where
 * it's controlled is both honest and more useful than a dead input.
 */

export type BehaviourState = "on" | "off" | "attention";

export interface BehaviourRow {
  label: string;
  value: string;
  state?: BehaviourState;
  /** Where this is actually controlled — an env var, a file, another screen. */
  detail?: string;
}

const STATE_ICON: Record<BehaviourState, ReactNode> = {
  on: <CircleCheck className="h-3.5 w-3.5 shrink-0 text-success" />,
  off: <CircleMinus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />,
  attention: <CircleAlert className="h-3.5 w-3.5 shrink-0 text-warning" />,
};

export function CurrentBehaviour({
  title,
  description,
  rows,
  footnote,
  link,
}: {
  title: string;
  description?: string;
  rows: BehaviourRow[];
  footnote?: ReactNode;
  link?: { href: string; label: string; external?: boolean };
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>

      <div className="flex flex-col divide-y divide-border/60">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 px-5 py-3">
            <span className="flex min-w-0 items-start gap-2">
              {STATE_ICON[row.state ?? "off"]}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm text-foreground">{row.label}</span>
                {row.detail && <span className="text-xs text-muted-foreground">{row.detail}</span>}
              </span>
            </span>
            <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{row.value}</span>
          </div>
        ))}
      </div>

      {(footnote || link) && (
        <div className="flex flex-col gap-2 border-t border-border px-5 py-3">
          {footnote && <p className="text-xs text-muted-foreground">{footnote}</p>}
          {link &&
            (link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : (
              <Link
                href={link.href}
                className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ))}
        </div>
      )}
    </section>
  );
}
