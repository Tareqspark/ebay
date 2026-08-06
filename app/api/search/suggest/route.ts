import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";
import { searchCategories } from "@/lib/category-utils";

/**
 * Suggestions for the storefront search bar. Returns products as well as
 * categories: the bar previously called /api/categories/search alone, so
 * typing any product name — the most obvious thing a shopper types — showed
 * "No matches" even when that product was in the catalog and its results
 * page worked.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ categories: [], products: [] });

  const [categories, products] = await Promise.all([searchCategories(q, 4), searchProducts(q, 6)]);

  return NextResponse.json({
    categories,
    // Only the fields the dropdown renders — never the whole product object.
    products: products.map((p) => ({ id: p.id, slug: p.slug, title: p.title, image: p.images[0], price: p.price })),
  });
}
