import { NextResponse } from "next/server";
import { getOrderEvents } from "@/lib/admin/order-events";
import { requirePermission } from "@/lib/admin/permissions";

/**
 * An order's timeline, fetched when its detail panel opens rather than
 * bundled into the orders table's payload — that table holds every order in
 * memory, and history is only ever read one order at a time.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermission("orders");
  if (guard) return NextResponse.json(guard, { status: 403 });

  const { id } = await params;
  return NextResponse.json({ events: await getOrderEvents(id) });
}
