import Image from "next/image";
import Link from "next/link";

export interface SubcategoryGridItem {
  id: string;
  name: string;
  href: string;
  imageSeed: string;
}

export function SubcategoryGrid({
  title,
  items,
}: {
  title: string;
  items: SubcategoryGridItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={`https://picsum.photos/seed/${item.imageSeed}/400/400`}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-2.5">
              <p className="line-clamp-2 text-sm font-medium text-foreground">{item.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
