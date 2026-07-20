"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getBreadcrumbTrail } from "@/lib/admin/nav";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const trail = getBreadcrumbTrail(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {trail.map((entry, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={entry.href + entry.label} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="font-medium text-foreground">{entry.label}</span>
            ) : (
              <Link href={entry.href} className="text-muted-foreground hover:text-foreground">
                {entry.label}
              </Link>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
          </span>
        );
      })}
    </nav>
  );
}
