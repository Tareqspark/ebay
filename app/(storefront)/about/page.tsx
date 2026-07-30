import type { Metadata } from "next";
import Link from "next/link";
import { CompanyPage, CompanySection } from "@/components/company/company-page";

export const metadata: Metadata = { title: "About Cartebay" };

export default function AboutPage() {
  return (
    <CompanyPage
      title="About Cartebay"
      subtitle="Cartebay is a single-vendor online store built for how people actually shop in the US — a deep, well-organized catalog across electronics, home, fashion, and more, with one quality bar and one team standing behind every order."
    >
      <CompanySection heading="What we're not">
        <p>We&apos;re not a marketplace. There&apos;s no third-party sellers, no seller ratings separate from our own, and no &ldquo;sold by X, fulfilled by Y&rdquo; ambiguity. Every item on Cartebay is sold directly by Cartebay, and every order is covered by the same shipping, returns, and support policy — no matter which category it comes from.</p>
      </CompanySection>

      <CompanySection heading="How we're organized">
        <p>Most single-vendor stores top out at a couple of levels of navigation and dump everything else into a flat grid. Cartebay&apos;s catalog runs three levels deep — over 1,400 specific categories — so you can go from &ldquo;Electronics&rdquo; to &ldquo;Headphones&rdquo; to exactly the kind you&apos;re looking for, instead of scrolling through a wall of unrelated filters.</p>
        <p>Products come to us two ways: some we stock ourselves in our own warehouse network, and others ship directly from vetted supplier partners. Either way, it&apos;s the same Cartebay checkout, the same order tracking, and the same customer support team if anything needs fixing.</p>
      </CompanySection>

      <CompanySection heading="Where we're based">
        <p>
          Cartebay is headquartered in Long Beach, California.
          <br />
          1310 Pine Ave #D, Long Beach, CA 90813
          <br />
          Phone: <a href="tel:+15622733989">(562) 273-3989</a>
        </p>
      </CompanySection>

      <CompanySection heading="Get in touch">
        <p>Questions about an order, a product, or anything else? Visit our <Link href="/help">Contact Information</Link> page, or read more about how we handle shipping and returns in our <Link href="/help/shipping">Shipping Policy</Link> and <Link href="/help/returns">Refund Policy</Link>.</p>
      </CompanySection>
    </CompanyPage>
  );
}
