import { NextRequest, NextResponse } from "next/server";
import { searchCjCatalog } from "@/lib/admin/cj-catalog";
import type { CjStockStatus, CjWarehouse } from "@/lib/admin/types";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const result = searchCjCatalog({
    q: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    warehouse: (params.get("warehouse") as CjWarehouse) || undefined,
    stockStatus: (params.get("stockStatus") as CjStockStatus) || undefined,
    hideImported: params.get("hideImported") === "1",
    page: params.get("page") ? Number(params.get("page")) : undefined,
    pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
  });
  return NextResponse.json(result);
}
