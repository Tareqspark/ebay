import Image from "next/image";

interface CategoryHeroProps {
  title: string;
  description: string;
  image: string;
  productCount: number;
}

export function CategoryHero({ title, description, image, productCount }: CategoryHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl">
      <div className="relative h-[180px] sm:h-[240px]">
        <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <h1 className="text-2xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">{description}</p>
          <p className="mt-3 text-xs font-medium text-white/70">
            {productCount.toLocaleString()} products available
          </p>
        </div>
      </div>
    </section>
  );
}
