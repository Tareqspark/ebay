import { NextRequest, NextResponse } from "next/server";
import { searchCategories } from "@/lib/category-utils";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 8;

  const results = await searchCategories(q, limit);
  return NextResponse.json({ results });
}
