import Image from "next/image";
import Link from "next/link";
import { getBannerForPlacement, type BannerPlacement } from "@/lib/banners";

/**
 * Uploaded creatives have no known intrinsic size, so each slot fixes its own
 * aspect ratio and the image covers it. That keeps a wrong-sized upload from
 * shifting the page around it, and means the slot occupies identical space
 * before and after the image loads.
 */
const SLOT_SHAPE: Record<BannerPlacement, string> = {
  "top-bar": "aspect-[1440/60] min-h-[36px]",
  "homepage-top": "aspect-[1440/220] rounded-xl",
  "homepage-mid": "aspect-[1440/200] rounded-xl",
  "homepage-bottom": "aspect-[1440/200] rounded-xl",
  "category-top": "aspect-[1440/170] rounded-xl",
  "product-sidebar": "aspect-square rounded-lg",
  "cart-page": "aspect-[1200/160] rounded-lg",
};

/** Only the top bar spans the full viewport; every other slot sits inside a page container that already caps its width. */
const FULL_BLEED: BannerPlacement[] = ["top-bar"];

interface BannerSlotProps {
  placement: BannerPlacement;
  className?: string;
}

export async function BannerSlot({ placement, className }: BannerSlotProps) {
  const banner = await getBannerForPlacement(placement);
  if (!banner) return null;

  const image = (
    <Image
      src={banner.imageUrl}
      alt={banner.altText}
      fill
      sizes={placement === "product-sidebar" ? "(max-width: 1024px) 100vw, 320px" : "100vw"}
      className="object-cover"
    />
  );

  const shape = `relative block overflow-hidden ${SLOT_SHAPE[placement]} ${
    FULL_BLEED.includes(placement) ? "w-full" : "w-full bg-muted"
  } ${className ?? ""}`;

  if (!banner.href) {
    return <div className={shape}>{image}</div>;
  }

  if (banner.isExternal) {
    return (
      // rel="sponsored" marks this as a paid placement so it doesn't pass
      // ranking signal; noopener stops the opened tab reaching window.opener.
      <a href={banner.href} target="_blank" rel="noopener noreferrer sponsored" className={shape}>
        {image}
      </a>
    );
  }

  return (
    <Link href={banner.href} className={shape}>
      {image}
    </Link>
  );
}
