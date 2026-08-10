"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * A password field with a reveal toggle.
 *
 * Uncontrolled and forwarding every prop through, so it drops into the
 * existing `<form action={…}>` submissions unchanged — these forms post the
 * field by name rather than holding it in React state, and turning them
 * controlled to add an eye icon would be a much larger change than the
 * feature warrants.
 *
 * The toggle is type="button": inside a form, a button with no explicit type
 * submits it, so revealing the password would attempt a sign-in.
 */
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [reveal, setReveal] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={reveal ? "text" : "password"}
        // Room for the button so a long password never runs underneath it.
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setReveal((r) => !r)}
        // Announced to screen readers, which can't infer state from an icon.
        aria-label={reveal ? "Hide password" : "Show password"}
        aria-pressed={reveal}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
