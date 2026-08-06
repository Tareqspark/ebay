import { NextResponse } from "next/server";
import { readBannerImage } from "@/lib/uploads";

/**
 * Serves admin-uploaded banner images from UPLOAD_DIR. Uploads live outside
 * the app directory (see lib/uploads.ts), so they can't be served as static
 * assets out of public/ — this route is what makes them reachable, and it
 * behaves identically in local dev and on the droplet, with no nginx alias
 * to keep in sync.
 *
 * Public on purpose: these are storefront banner images. readBannerImage
 * rejects any filename it didn't generate, so the route can only ever read
 * back files that were uploaded through the admin.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const image = await readBannerImage(file);
  if (!image) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(image.body, {
    headers: {
      "Content-Type": image.contentType,
      // Filenames are content-addressed by ULID and never reused, so a
      // replaced banner gets a new URL rather than a stale cached image.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
