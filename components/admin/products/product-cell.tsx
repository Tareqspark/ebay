import Image from "next/image";

export function ProductCell({ image, title, brandName }: { image: string; title: string; brandName: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        <Image src={image} alt="" fill sizes="36px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{brandName}</p>
      </div>
    </div>
  );
}
