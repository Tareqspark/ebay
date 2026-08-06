import { NextRequest, NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/uploads";
import { requirePermission } from "@/lib/admin/permissions";

/**
 * Photo upload for own-brand products (components/admin/products/product-form-dialog.tsx).
 * A Route Handler rather than a Server Action because the dialog needs the
 * stored URL back immediately to show a thumbnail, before the product row
 * itself exists.
 */
export async function POST(request: NextRequest) {
  const guard = await requirePermission("products");
  if (guard) return NextResponse.json(guard, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const result = await saveUploadedImage(file, "products");
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
