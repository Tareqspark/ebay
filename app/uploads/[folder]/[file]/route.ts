import { NextResponse } from "next/server";
import { readUploadedImage } from "@/lib/uploads";

/**
 * Serves admin-uploaded images (banner creatives, own-product photos) from
 * UPLOAD_DIR. Uploads live outside the app directory (see lib/uploads.ts) so
 * they survive deploys, which means they can't be static assets in public/ —
 * this route is what makes them reachable, and it behaves identically in
 * local dev and on the droplet with no nginx alias to keep in sync.
 *
 * Public on purpose: these are storefront images. readUploadedImage accepts
 * only an allowlisted folder and a filename it generated, so the route can
 * never read back anything else.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ folder: string; file: string }> }) {
  const { folder, file } = await params;
  const image = await readUploadedImage(folder, file);
  if (!image) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(image.body, {
    headers: {
      "Content-Type": image.contentType,
      // Filenames are ULIDs and never reused, so a replaced image gets a new
      // URL rather than a stale cached one.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
