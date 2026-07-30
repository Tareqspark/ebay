import type { Metadata } from "next";
import { CompanyPage, CompanySection } from "@/components/company/company-page";

export const metadata: Metadata = { title: "Affiliate Program" };

export default function AffiliatesPage() {
  return (
    <CompanyPage
      title="Affiliate Program"
      subtitle="Earn a commission by sending your audience to Cartebay's catalog of thousands of products across electronics, home, fashion, and more."
    >
      <CompanySection heading="How it works">
        <ul>
          <li>Apply below and, once approved, get a unique tracking link for any Cartebay page — a specific product, a category, or the homepage.</li>
          <li>Earn <strong>5% commission</strong> on qualifying purchases made by shoppers who click your link, tracked for <strong>30 days</strong> from their first click.</li>
          <li>Commissions are paid out monthly once your balance reaches $50, for referred orders within the United States.</li>
        </ul>
      </CompanySection>

      <CompanySection heading="Who it's for">
        <p>Bloggers, review sites, deal aggregators, and social creators with a US audience interested in the categories we carry. We review every application manually — there&apos;s no minimum follower count, but we do check that the content is a good fit before approving.</p>
      </CompanySection>

      <CompanySection heading="How to apply">
        <p>Email <a href="mailto:affiliates@cartebay.com">affiliates@cartebay.com</a> with a link to your site or channel and a sentence on how you&apos;d promote Cartebay. We typically respond within a week.</p>
      </CompanySection>

      <CompanySection heading="Questions?">
        <p>Reach out at <a href="mailto:affiliates@cartebay.com">affiliates@cartebay.com</a> or call <a href="tel:+15622733989">(562) 273-3989</a>.</p>
      </CompanySection>
    </CompanyPage>
  );
}
