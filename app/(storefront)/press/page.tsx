import type { Metadata } from "next";
import Link from "next/link";
import { CompanyPage, CompanySection } from "@/components/company/company-page";

export const metadata: Metadata = { title: "Press" };

export default function PressPage() {
  return (
    <CompanyPage
      title="Press"
      subtitle="Resources for journalists and media covering Cartebay."
    >
      <CompanySection heading="Company boilerplate">
        <p>Cartebay is a single-vendor online store serving customers across the United States, with a catalog spanning electronics, home goods, fashion, and thousands more categories. Every item is sold and fulfilled directly by Cartebay — a deep, three-level product taxonomy and one consistent shipping and returns policy, rather than a marketplace of third-party sellers. Cartebay is headquartered in Long Beach, California.</p>
      </CompanySection>

      <CompanySection heading="Media inquiries">
        <p>For interview requests, data requests, or anything else press-related, contact us at <a href="mailto:press@cartebay.com">press@cartebay.com</a>. We do our best to respond within two business days.</p>
      </CompanySection>

      <CompanySection heading="Brand assets">
        <p>Logo files and brand guidelines are available on request — email <a href="mailto:press@cartebay.com">press@cartebay.com</a> and let us know what you need them for.</p>
      </CompanySection>

      <CompanySection heading="Company details">
        <p>
          Cartebay Commerce, Inc.
          <br />
          1310 Pine Ave #D, Long Beach, CA 90813
          <br />
          Phone: <a href="tel:+15622733989">(562) 273-3989</a>
        </p>
      </CompanySection>

      <CompanySection heading="More about us">
        <p>See our <Link href="/about">About Cartebay</Link> page, or reach general support through our <Link href="/help">Contact Information</Link> page.</p>
      </CompanySection>
    </CompanyPage>
  );
}
