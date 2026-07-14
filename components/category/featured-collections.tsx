import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface FeaturedCollectionItem {
  id: string;
  name: string;
  href: string;
  imageSeed: string;
  tagline: string;
}

export function FeaturedCollections({ items }: { items: FeaturedCollectionItem[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">Featured Collections</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group relative flex h-48 flex-col justify-end overflow-hidden rounded-xl"
          >
            <Image
              src={`https://picsum.photos/seed/${item.imageSeed}-collection/700/500`}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="relative p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-white/75">{item.tagline}</p>
              <p className="mt-1 text-lg font-semibold text-white">{item.name}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/90">
                Explore
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
