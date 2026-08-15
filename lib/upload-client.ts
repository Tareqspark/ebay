/**
 * Browser-side helper for posting an image to one of the admin upload routes.
 *
 * Exists because every caller had the same latent bug: they did
 *
 *   const data = await res.json();
 *   if (!res.ok) setError(data.error ?? "Upload failed");
 *
 * which reads fine until something upstream of Next.js answers. A proxy
 * rejecting an oversized body returns an HTML error page, so `res.json()`
 * throws *before* the `res.ok` check runs, the whole thing lands in the
 * caller's catch, and the user is told to "check your connection" for a file
 * that was simply too big. That happened live: nginx capped bodies at its
 * default 1MB while the app advertised 12MB, and every failure in between
 * blamed the network.
 *
 * No server imports — safe in "use client" files.
 */

export interface UploadOutcome {
  url?: string;
  error?: string;
}

function megabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}

export async function uploadImageFile(endpoint: string, file: File): Promise<UploadOutcome> {
  const body = new FormData();
  body.append("file", file);

  let res: Response;
  try {
    res = await fetch(endpoint, { method: "POST", body });
  } catch {
    // Only a genuine transport failure reaches here now.
    return { error: "Couldn't reach the server — check your connection and try again" };
  }

  // 413 never comes from the app: its own size check returns a JSON message
  // naming the limit. This is the proxy in front, so say so plainly rather
  // than letting it fall through to a parse error.
  if (res.status === 413) {
    return { error: `Rejected by the server as too large (${megabytes(file.size)}MB) — try a smaller image` };
  }

  let data: { url?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON body — an error page from something between us and the app.
  }

  if (!res.ok) return { error: data.error ?? `Upload failed (HTTP ${res.status})` };
  if (!data.url) return { error: "Upload finished but no image came back — please try again" };
  return { url: data.url };
}
