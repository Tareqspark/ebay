import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  description?: string;
  viewAllHref?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ title, description, viewAllHref, actions, children, className, bodyClassName }: PanelProps) {
  return (
    <section className={cn("flex flex-col rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {viewAllHref && (
            <Link href={viewAllHref} className="text-xs font-medium text-muted-foreground hover:text-foreground">
              View all
            </Link>
          )}
        </div>
      </div>
      <div className={cn("flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
