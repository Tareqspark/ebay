"use client";

import { useEffect } from "react";
import { logClientErrorAction } from "@/lib/error-log-actions";

// Catches errors that escape the root layout itself (rare — most errors
// are caught by app/error.tsx or app/admin/(dashboard)/error.tsx below
// it) — Next.js requires this to render its own <html>/<body> since it
// fully replaces the root layout when it triggers.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logClientErrorAction(error.message, error.stack, typeof window !== "undefined" ? window.location.href : "unknown");
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: "#666", maxWidth: "28rem" }}>
            This has been reported. Try reloading the page — if it keeps happening, come back in a few minutes.
          </p>
          <button
            onClick={reset}
            style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", background: "#111", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
