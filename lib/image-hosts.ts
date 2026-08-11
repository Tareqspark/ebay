/**
 * Hosts next/image is allowed to load from.
 *
 * Single source of truth: next.config.ts builds its `images.remotePatterns`
 * from this list, and admin input validation checks pasted URLs against it.
 * They have to agree — next/image *throws while rendering* for a host that
 * isn't configured, so an admin pasting an unlisted URL would otherwise take
 * down every page showing that image, including the admin screen needed to
 * correct it.
 *
 * A leading "*." matches exactly one subdomain label, the same way
 * remotePatterns does.
 */
export const IMAGE_HOSTS = ["picsum.photos", "*.cjdropshipping.com", "*.aliyuncs.com"] as const;

export function isAllowedImageHost(hostname: string): boolean {
  return IMAGE_HOSTS.some((pattern) => {
    if (!pattern.startsWith("*.")) return hostname === pattern;
    const suffix = pattern.slice(1); // ".cjdropshipping.com"
    if (!hostname.endsWith(suffix)) return false;
    const label = hostname.slice(0, -suffix.length);
    // One label only: "a.b.cjdropshipping.com" doesn't match "*.cjdropshipping.com".
    return label.length > 0 && !label.includes(".");
  });
}
