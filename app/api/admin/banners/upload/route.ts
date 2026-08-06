import { NextRequest, NextResponse } from "next/server";
import { saveBannerImage } from "@/lib/uploads";
import { requirePermission } from "@/lib/admin/permissions";

/**
 * Banner image upload for components/admin/banners/banner-form-dialog.tsx.
 * A Route Handler rather than a Server Action because the dialog needs the
 * stored URL back immediately to render a preview before the banner row
 * itself is saved.
 */
export async function POST(request: NextRequest) {
  const guard = await requirePermission("marketing");
  if (guard) return NextResponse.json(guard, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const result = await saveBannerImage(file);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
