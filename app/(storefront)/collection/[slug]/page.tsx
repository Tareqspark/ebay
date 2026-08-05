import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductExplorer } from "@/components/product/product-explorer";
import { getCollectionBySlug, getCollectionProducts } from "@/lib/collections";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection Not Found" };
  return { title: collection.name, description: collection.description ?? `Shop ${collection.name} at Cartebay.` };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await getCollectionProducts(collection.id);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <div className="relative flex h-48 flex-col justify-end overflow-hidden rounded-xl sm:h-64">
        <Image
          src={`https://picsum.photos/seed/${collection.imageSeed}-collection/1400/500`}
          alt={collection.name}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="relative p-5 sm:p-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{collection.name}</h1>
          {collection.description && <p className="mt-1.5 max-w-xl text-sm text-white/85">{collection.description}</p>}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
          {products.length.toLocaleString()} {products.length === 1 ? "Product" : "Products"}
        </h2>
        <ProductExplorer products={products} brands={[]} />
      </section>
    </div>
  );
}
