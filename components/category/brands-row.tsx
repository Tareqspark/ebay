import type { Brand } from "@/lib/types";

export function BrandsRow({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">Popular Brands</h2>
      <div className="flex flex-wrap gap-2.5">
        {brands.map((brand) => (
          <span
            key={brand.id}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </section>
  );
}
