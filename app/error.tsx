"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logClientErrorAction } from "@/lib/error-log-actions";

// Root-level boundary — catches anything not already caught by a more
// specific error.tsx (app/(storefront)/error.tsx, app/admin/(dashboard)/
// error.tsx), e.g. /admin/login, which sits outside both of those groups.
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logClientErrorAction(error.message, error.stack, typeof window !== "undefined" ? window.location.href : "unknown");
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
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
