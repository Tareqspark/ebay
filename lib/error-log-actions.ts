"use server";

import { logError } from "@/lib/error-log";

/** The only way a browser-side error boundary (necessarily a Client Component) can get an error into the DB log — everywhere else calls logError() directly. */
export async function logClientErrorAction(message: string, stack: string | undefined, url: string): Promise<void> {
  await logError(new Error(message), { source: "render-boundary", label: url, url, stackOverride: stack });
}
