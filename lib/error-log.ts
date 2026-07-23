import "server-only";
import { db } from "@/db";
import { errorLogs } from "@/db/schema";
import { newId } from "@/lib/id";

export type ErrorLogSource = (typeof errorLogs.$inferSelect)["source"];

/**
 * Best-effort structured error logging — always console.error()s first
 * (so local dev still sees it immediately in the terminal, same as every
 * existing catch block before this), then tries to persist it so it shows
 * up in /admin/settings/errors. The DB write is wrapped in its own
 * try/catch: a logging failure (e.g. the DB itself is down) must never
 * throw and mask the original error.
 */
export async function logError(
  error: unknown,
  options: { source: ErrorLogSource; label: string; url?: string; stackOverride?: string }
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  // stackOverride covers the one case where the caller has a real stack
  // that doesn't live on `error` itself — a client-side error boundary
  // reporting through logClientErrorAction, where the original Error
  // object never leaves the browser and only its message + stack string
  // cross the server-action boundary.
  const stack = options.stackOverride ?? (error instanceof Error ? error.stack : undefined);

  console.error(`[${options.label}]`, error);

  try {
    await db.insert(errorLogs).values({
      id: newId(),
      source: options.source,
      label: options.label,
      message,
      stack: stack ?? null,
      url: options.url ?? null,
    });
  } catch (loggingError) {
    console.error("[logError] failed to persist error log", loggingError);
  }
}
