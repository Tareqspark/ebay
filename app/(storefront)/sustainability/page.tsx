import type { Metadata } from "next";
import Link from "next/link";
import { CompanyPage, CompanySection } from "@/components/company/company-page";

export const metadata: Metadata = { title: "Sustainability" };

export default function SustainabilityPage() {
  return (
    <CompanyPage
      title="Sustainability"
      subtitle="We don't claim to have this fully solved, but here's how we think about the impact of what we ship."
    >
      <CompanySection heading="Packaging">
        <p>Where we control packaging directly — our own warehouse-fulfilled orders — we default to right-sized boxes and recyclable or recycled-content materials over oversized packaging and excess void fill. We&apos;re working through our packaging supply chain category by category rather than promising it&apos;s all solved today.</p>
      </CompanySection>

      <CompanySection heading="Shipping">
        <p>Orders over $50 default to standard (not expedited) shipping, which consolidates freight and reduces the number of individual trips per package compared to rush shipping. When an order contains multiple self-stocked items, we combine them into a single shipment whenever possible instead of sending separate boxes.</p>
      </CompanySection>

      <CompanySection heading="Supplier-fulfilled items">
        <p>Some products on Cartebay ship directly from our supplier network rather than our own warehouse (this is noted on the product page). We&apos;re a smaller player in those supply chains and can&apos;t control every step of them, but we prioritize suppliers who ship efficiently and package responsibly, and we revisit that list over time.</p>
      </CompanySection>

      <CompanySection heading="Where we're headed">
        <p>This page will grow as our practices do — we&apos;d rather under-promise here than list certifications we don&apos;t actually hold. If you have questions about the sustainability of a specific product or order, reach out at <a href="mailto:support@cartebay.com">support@cartebay.com</a>.</p>
      </CompanySection>

      <CompanySection heading="More about us">
        <p>See our <Link href="/about">About Cartebay</Link> page, or our <Link href="/help/shipping">Shipping Policy</Link> for delivery details.</p>
      </CompanySection>
    </CompanyPage>
  );
}
