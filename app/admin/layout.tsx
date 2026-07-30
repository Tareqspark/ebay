import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Cartebay Admin",
    template: "%s | Cartebay Admin",
  },
  description: "Operations console for the Cartebay storefront.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
