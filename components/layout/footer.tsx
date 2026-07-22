import Link from "next/link";
import { Mail, MessageCircle, Rss, Share2, ShoppingBag } from "lucide-react";
import { categoryHref, getCategoryTree } from "@/lib/category-utils";

const helpLinks = [
  { label: "Contact Us", href: "/help" },
  { label: "Shipping & Delivery", href: "/help/shipping" },
  { label: "Returns & Refunds", href: "/help/returns" },
  { label: "Track Your Order", href: "/track-order" },
];

const companyLinks = [
  { label: "About Baruashop", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Affiliate Program", href: "/affiliates" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Legal Notice", href: "/legal/notice" },
  { label: "Do Not Sell My Info", href: "/legal/privacy" },
];

export async function Footer() {
  const tree = await getCategoryTree();
  const shopColumns = tree.slice(0, 5);

  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {shopColumns.map((category) => (
            <div key={category.id}>
              <h3 className="mb-3 text-sm font-semibold text-background">{category.name}</h3>
              <ul className="flex flex-col gap-2">
                {category.children.slice(0, 6).map((child) => (
                  <li key={child.id}>
                    <Link
                      href={categoryHref(category.slug, child.slug)}
                      className="text-sm text-background/70 hover:text-background hover:underline"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-background">Customer Care</h3>
            <ul className="flex flex-col gap-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/70 hover:text-background hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-background/15 pt-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-background">Company</h3>
            <ul className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/70 hover:text-background hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-background">Legal</h3>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-background/70 hover:text-background hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-background">Follow Us</h3>
            <div className="flex gap-3">
              {[Share2, MessageCircle, Rss, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 text-background hover:bg-background/20"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-background">Baruashop</span>
          </Link>
          <p className="text-xs text-background/60">
            © {new Date().getFullYear()} Baruashop Commerce, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
