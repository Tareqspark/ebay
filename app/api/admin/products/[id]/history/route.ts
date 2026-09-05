import { NextResponse } from "next/server";
import { getProductHistory } from "@/lib/admin/data";
import { requirePermission } from "@/lib/admin/permissions";

/**
 * A product's edit history, fetched when its detail panel opens rather than
 * bundled into the products table's payload — that table holds the whole
 * catalogue in memory, and history is only ever read one product at a time.
 *
 * Mirrors the orders/[id]/events route.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("products");
  if (guard) return NextResponse.json(guard, { status: 403 });

  const { id } = await params;
  return NextResponse.json({ events: await getProductHistory(id) });
}
