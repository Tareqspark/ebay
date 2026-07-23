"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logClientErrorAction } from "@/lib/error-log-actions";

export default function StorefrontError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logClientErrorAction(error.message, error.stack, typeof window !== "undefined" ? window.location.href : "unknown");
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        This has been reported. Try again, or head back home.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button render={<Link href="/" />} nativeButton={false}>
          Go home
        </Button>
      </div>
    </div>
  );
}
