import { NextRequest, NextResponse } from "next/server";
import { saveCategoryImage } from "@/lib/uploads";
import { requirePermission } from "@/lib/admin/permissions";

/**
 * Category image upload for components/admin/categories/category-image-upload.tsx.
 * A Route Handler rather than a Server Action, matching the banner upload:
 * the caller needs the stored URL back immediately to preview it, and in the
 * tree view the upload happens before (and independently of) any form save.
 */
export async function POST(request: NextRequest) {
  const guard = await requirePermission("categories");
  if (guard) return NextResponse.json(guard, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const result = await saveCategoryImage(file);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
