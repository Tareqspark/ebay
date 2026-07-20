"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ANNOUNCEMENTS } from "@/app/data/admin/activity";
import { formatRelative } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

const LEVEL_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
};
const LEVEL_CLASS = {
  info: "text-sky-600 dark:text-sky-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const unreadCount = ANNOUNCEMENTS.filter((a) => !readIds.has(a.id)).length;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setReadIds(new Set(ANNOUNCEMENTS.map((a) => a.id)));
      }}
    >
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Announcements</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {ANNOUNCEMENTS.map((a) => {
            const Icon = LEVEL_ICON[a.level];
            return (
              <div key={a.id} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", LEVEL_CLASS[a.level])} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">{formatRelative(a.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
