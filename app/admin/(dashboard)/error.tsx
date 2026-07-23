"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logClientErrorAction } from "@/lib/error-log-actions";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logClientErrorAction(error.message, error.stack, typeof window !== "undefined" ? window.location.href : "unknown");
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
      <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This has been reported and is visible in Settings → Error Logs.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
        <Button size="sm" render={<Link href="/admin" />} nativeButton={false}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
