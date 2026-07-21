import { NextRequest, NextResponse } from "next/server";
import { getProducts, getOrders, getCustomers, getAdminCategories } from "@/lib/admin/data";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) {
    return NextResponse.json({ products: [], orders: [], customers: [], categories: [] });
  }

  const [products, orders, customers, categories] = await Promise.all([
    getProducts(),
    getOrders(),
    getCustomers(),
    getAdminCategories(),
  ]);

  const productMatches = products
    .filter((p) => p.title.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({ id: p.id, title: p.title }));

  const orderMatches = orders
    .filter((o) => o.id.toLowerCase().includes(q))
    .slice(0, 5)
    .map((o) => ({ id: o.id, total: o.total }));

  const customerMatches = customers
    .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    .slice(0, 5)
    .map((c) => ({ id: c.id, name: c.name, email: c.email }));

  const categoryMatches = categories
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, 4)
    .map((c) => ({ id: c.id, name: c.name }));

  return NextResponse.json({
    products: productMatches,
    orders: orderMatches,
    customers: customerMatches,
    categories: categoryMatches,
  });
}
