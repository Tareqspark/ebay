import type { Metadata } from "next";
import { CompanyPage, CompanySection } from "@/components/company/company-page";

export const metadata: Metadata = { title: "Careers" };

const DEPARTMENTS = [
  { name: "Merchandising & Catalog", blurb: "Category strategy, supplier sourcing, and product data quality across a 1,400+ category catalog." },
  { name: "Customer Support", blurb: "Order, shipping, and returns support for shoppers across the US." },
  { name: "Engineering", blurb: "The storefront, checkout, and admin systems that run the whole operation." },
  { name: "Warehouse & Fulfillment", blurb: "Receiving, storage, and outbound shipping for self-stocked inventory." },
];

export default function CareersPage() {
  return (
    <CompanyPage
      title="Careers at Cartebay"
      subtitle="We're a small, US-based team building a single-vendor store that takes catalog depth and order reliability seriously. If that sounds like your kind of problem, we'd like to hear from you."
    >
      <CompanySection heading="Open roles">
        <p>We don&apos;t have specific openings posted right now, but we&apos;re always glad to hear from people who care about the details of ecommerce — catalog structure, checkout reliability, or making sure a return actually gets refunded on time. Send us a note at <a href="mailto:careers@cartebay.com">careers@cartebay.com</a> with what you&apos;re interested in, and we&apos;ll keep it on file for when a role opens up.</p>
      </CompanySection>

      <CompanySection heading="Where we hire">
        <ul>
          {DEPARTMENTS.map((d) => (
            <li key={d.name}><strong>{d.name}</strong> — {d.blurb}</li>
          ))}
        </ul>
      </CompanySection>

      <CompanySection heading="Where we're based">
        <p>
          Our headquarters is in Long Beach, California, at 1310 Pine Ave #D, Long Beach, CA 90813. Some roles are remote-friendly within the US — we&apos;ll note that when a specific position opens.
        </p>
      </CompanySection>

      <CompanySection heading="Questions?">
        <p>Reach out at <a href="mailto:careers@cartebay.com">careers@cartebay.com</a> or call <a href="tel:+15622733989">(562) 273-3989</a>.</p>
      </CompanySection>
    </CompanyPage>
  );
}
