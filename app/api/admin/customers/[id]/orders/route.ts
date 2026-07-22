import { NextResponse } from "next/server";
import { getOrdersForCustomer } from "@/lib/admin/data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orders = await getOrdersForCustomer(id);
  return NextResponse.json({ orders });
}
