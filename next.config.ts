import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        // Real CJdropshipping product images (scripts/import-cj-products.ts).
        // Wildcarded — CJ serves images from several subdomains (cf.*,
        // oss-cf.*, and regional oss.*.aliyuncs.com hosts seen in their docs).
        protocol: "https",
        hostname: "*.cjdropshipping.com",
      },
      {
        protocol: "https",
        hostname: "*.aliyuncs.com",
      },
    ],
  },
};

export default nextConfig;
