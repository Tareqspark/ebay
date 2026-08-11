import type { NextConfig } from "next";
import { IMAGE_HOSTS } from "./lib/image-hosts";

const nextConfig: NextConfig = {
  images: {
    // Derived from lib/image-hosts.ts so admin-side URL validation and what
    // next/image will actually load can't drift apart. picsum.photos is the
    // placeholder imagery; the CJ hosts serve real product photos imported
    // by scripts/import-cj-products.ts (several subdomains — cf.*, oss-cf.*,
    // and regional oss.*.aliyuncs.com hosts per their docs).
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

export default nextConfig;
