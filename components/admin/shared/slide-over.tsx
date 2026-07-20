"use client";

import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SlideOverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

/** Right-side detail panel — the admin's standard alternative to page navigation. */
export function SlideOver({ open, onOpenChange, title, children, footer, wide = false }: SlideOverProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("flex w-full flex-col gap-0 p-0 sm:max-w-lg", wide && "sm:max-w-2xl")}
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-border px-5 py-3">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
