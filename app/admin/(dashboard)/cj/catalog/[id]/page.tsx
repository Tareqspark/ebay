import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { productMeta, products } from "@/db/schema";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Panel } from "@/components/admin/shared/panel";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getCjCatalogItemById } from "@/lib/admin/cj-catalog";
import { getAdminCategories, getCjShippingLines } from "@/lib/admin/data";
import { formatMoney } from "@/lib/admin/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getCjCatalogItemById(id);
  return { title: item ? item.title : "CJ Product Not Found" };
}

/**
 * One CJ catalog listing.
 *
 * A Server Component so lib/admin/cj-catalog.ts can be read directly — that
 * module holds the 50,000-item file in memory and must never reach the
 * browser, which is why the catalog table pages through an API route instead
 * of filtering client-side.
 *
 * The numbers here are the point. The table shows cost and suggested retail;
 * a sourcing decision needs what's actually left after the shipping line is
 * paid, which is computed below rather than left for someone to work out.
 */
export default async function CjCatalogItemPage({ params }: PageProps) {
  const { id } = await params;
  const item = getCjCatalogItemById(id);
  if (!item) notFound();

  const [shippingLines, categories] = await Promise.all([getCjShippingLines(), getAdminCategories()]);
  const line = shippingLines.find((l) => l.id === item.shippingLineId);
  const categoryName = categories.find((c) => c.slug === item.categorySlug)?.name ?? item.categorySlug.replace(/-/g, " ");

  // Whether this listing is already in the catalogue, matched on the CJ id
  // that product_meta records at import time. The `imported` flag on the
  // listing itself is baked into the catalog file and can't point at a row.
  const [existing] = await db
    .select({ id: products.id, slug: products.slug, title: products.title })
    .from(productMeta)
    .innerJoin(products, eq(products.id, productMeta.productId))
    .where(eq(productMeta.cjProductId, item.cjProductId))
    .limit(1);

  const grossMargin = item.suggestedRetail - item.cost;
  const grossPercent = item.suggestedRetail > 0 ? (grossMargin / item.suggestedRetail) * 100 : 0;
  const shippingCost = line ? line.costPerOrder : 0;
  const landedCost = item.cost + shippingCost;
  const netMargin = item.suggestedRetail - landedCost;
  const netPercent = item.suggestedRetail > 0 ? (netMargin / item.suggestedRetail) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="link"
        size="sm"
        className="w-fit gap-1 px-0"
        nativeButton={false}
        render={
          <Link href="/admin/cj/catalog">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to catalog
          </Link>
        }
      />

      <PageHeader
        title={item.title}
        description={`CJ product ${item.cjProductId} · ${categoryName}`}
        actions={
          existing ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/product/${existing.slug}`} target="_blank">
                  View in storefront
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              }
            />
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <Panel title="Product image" bodyClassName="p-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={item.image} alt={item.title} fill sizes="300px" className="object-cover" />
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel
            title="Unit economics"
            description="What this listing earns per order, before and after the shipping line"
            bodyClassName="p-4"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="CJ cost" value={formatMoney(item.cost)} />
              <Stat label="Suggested retail" value={formatMoney(item.suggestedRetail)} />
              <Stat
                label="Gross margin"
                value={`${formatMoney(grossMargin)} · ${grossPercent.toFixed(1)}%`}
              />
              <Stat
                label="Net after shipping"
                value={`${formatMoney(netMargin)} · ${netPercent.toFixed(1)}%`}
                tone={netMargin <= 0 ? "bad" : netPercent < 20 ? "warn" : "good"}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Landed cost {formatMoney(landedCost)} — {formatMoney(item.cost)} for the item plus{" "}
              {formatMoney(shippingCost)} for {line ? line.name : "the shipping line"}.
              {netMargin <= 0
                ? " This listing loses money at the suggested retail price."
                : netPercent < 20
                  ? " Under 20% after shipping leaves little room for returns or ad spend."
                  : ""}
            </p>
          </Panel>

          <Panel title="Sourcing" bodyClassName="p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Warehouse" value={item.sourceWarehouse === "CN" ? "China" : "United States"} />
              <Stat label="Shipping line" value={line ? line.name : "—"} />
              <Stat label="Delivery estimate" value={line ? line.estimatedDays : "—"} />
              <Stat label="Variants" value={String(item.variantCount)} />
              <Stat label="Rating" value={item.rating > 0 ? `${item.rating.toFixed(1)} / 5` : "No rating"} />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Stock</span>
                <StatusBadge status={item.stockStatus} />
              </div>
            </div>
          </Panel>

          <Panel title="In your catalogue" bodyClassName="p-4">
            {existing ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-foreground">
                  Imported as{" "}
                  <Link href="/admin/products" className="font-medium text-primary hover:underline">
                    {existing.title}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  Matched on CJ product id {item.cjProductId}. Editing price, category or copy is done on the product,
                  not here — this page shows what CJ offers.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-foreground">Not imported</p>
                <p className="text-xs text-muted-foreground">
                  No product in the catalogue references this CJ id.
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" | "bad" }) {
  const toneClass =
    tone === "bad" ? "text-error" : tone === "warn" ? "text-warning" : tone === "good" ? "text-success" : "text-foreground";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${toneClass}`}>{value}</span>
    </div>
  );
}
