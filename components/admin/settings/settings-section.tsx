"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => void;
}

/**
 * The Save button appears only when a section can actually save something.
 *
 * It used to render unconditionally and fire toast.success("Settings saved")
 * on every click, including on the sections that persist nothing — so an
 * admin could set a value, be told it was saved, and find it reverted on the
 * next load. Sections wrapping their own form (the CJ fulfillment defaults)
 * were worse still: a real save button and a fake one, side by side.
 */
export function SettingsSection({ title, description, children, onSave }: SettingsSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col gap-4 px-5 py-4">{children}</div>
      {onSave && (
        <div className="flex justify-end border-t border-border px-5 py-3">
          <Button
            size="sm"
            onClick={() => {
              onSave();
              toast.success("Settings saved");
            }}
          >
            Save changes
          </Button>
        </div>
      )}
    </section>
  );
}
