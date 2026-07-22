import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Baruashop Admin",
    template: "%s | Baruashop Admin",
  },
  description: "Operations console for the Baruashop storefront.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
