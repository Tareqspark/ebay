import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

/** Powers the bundle product picker (components/admin/bundles/product-picker.tsx) — the admin catalog is 2,800+ items, too large to ship to a client component wholesale. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchProducts(q, 10);
  return NextResponse.json({
    products: results.map((p) => ({ id: p.id, title: p.title, image: p.images[0], price: p.price })),
  });
}
