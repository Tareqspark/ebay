import { NextRequest, NextResponse } from "next/server";
import { queryAdminProducts } from "@/lib/admin/product-query";
import { requirePermission } from "@/lib/admin/permissions";

/** One page of the admin Products table. See lib/admin/product-query.ts for why this isn't shipped whole. */
export async function GET(request: NextRequest) {
  const guard = await requirePermission("products");
  if (guard) return NextResponse.json(guard, { status: 403 });

  const p = request.nextUrl.searchParams;
  const result = await queryAdminProducts({
    page: Number(p.get("page")) || 1,
    pageSize: Number(p.get("pageSize")) || 25,
    search: p.get("q") ?? undefined,
    status: p.get("status") ?? undefined,
    visibility: p.get("visibility") ?? undefined,
    category: p.get("category") ?? undefined,
    source: p.get("source") ?? undefined,
    savedView: p.get("savedView") ?? undefined,
    sort: p.get("sort") ?? undefined,
    dir: (p.get("dir") as "asc" | "desc") ?? undefined,
  });
  return NextResponse.json(result);
}
