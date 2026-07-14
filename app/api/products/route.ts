import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/products";

export function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = getProductsByIds(ids);
  return NextResponse.json({ products });
}
