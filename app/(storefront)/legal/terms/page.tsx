import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 22, 2026"
      intro="These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of baruashop.com and any purchase you make from Baruashop. By creating an account, placing an order, or otherwise using our site, you agree to these Terms."
    >
      <LegalSection heading="1. Eligibility &amp; Accounts">
        <p>You must be at least 18 years old, or the age of majority in your state, to create an account and place an order. You&apos;re responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately at <a href="mailto:support@baruashop.com">support@baruashop.com</a> if you suspect unauthorized use.</p>
      </LegalSection>

      <LegalSection heading="2. Orders &amp; Acceptance">
        <p>Your order is an offer to purchase. We may accept, decline, or cancel any order at our discretion — for example if an item is out of stock, if we suspect fraud, or if a listing contained a pricing or description error. If we cancel an order after payment, you&apos;ll receive a full refund of any amount charged.</p>
        <p>We make reasonable efforts to display accurate pricing, descriptions, and images, but we do not warrant that product descriptions or other content are error-free.</p>
      </LegalSection>

      <LegalSection heading="3. Pricing &amp; Payment">
        <p>All prices are listed in US dollars and exclude applicable sales tax and shipping, which are calculated and shown at checkout. Payment is processed securely through Stripe at the time of purchase. We may change prices at any time, but changes won&apos;t affect orders you&apos;ve already placed.</p>
      </LegalSection>

      <LegalSection heading="4. Shipping, Returns &amp; Refunds">
        <p>Shipping timelines and costs are described in our <Link href="/help/shipping">Shipping Policy</Link>. Return and refund eligibility is described in our <Link href="/help/returns">Refund Policy</Link>. Both are part of these Terms.</p>
      </LegalSection>

      <LegalSection heading="5. Product Reviews &amp; User Content">
        <p>If you submit a product review or other content to Baruashop, you grant us a non-exclusive, royalty-free, worldwide license to use, display, and reproduce that content in connection with operating and promoting our site. You&apos;re solely responsible for content you submit, and it must not be false, defamatory, infringing, or otherwise unlawful. We may remove any content at our discretion.</p>
      </LegalSection>

      <LegalSection heading="6. Prohibited Conduct">
        <p>You agree not to: use the site for any unlawful purpose; attempt to gain unauthorized access to our systems or another user&apos;s account; interfere with the site&apos;s operation or security; scrape or harvest data from the site without permission; or resell products purchased from Baruashop without our written consent.</p>
      </LegalSection>

      <LegalSection heading="7. Intellectual Property">
        <p>The Baruashop name, logo, site design, and all original content on baruashop.com are owned by Baruashop or its licensors and protected by copyright, trademark, and other laws. You may not use, copy, or reproduce them without our written permission, except as necessary to use the site for its intended purpose (e.g. browsing and purchasing products).</p>
      </LegalSection>

      <LegalSection heading="8. Third-Party Links &amp; Services">
        <p>Our site may link to or rely on third-party services (such as our payment processor, email provider, and fulfillment suppliers). We&apos;re not responsible for the content, policies, or practices of third parties, and your use of third-party services may be subject to their own terms.</p>
      </LegalSection>

      <LegalSection heading="9. Disclaimer of Warranties">
        <p>THE SITE AND ALL PRODUCTS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE PROHIBITED BY LAW. Some states do not allow the exclusion of certain warranties, so some of the above may not apply to you.</p>
      </LegalSection>

      <LegalSection heading="10. Limitation of Liability">
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, BARUASHOP WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SITE OR PRODUCTS PURCHASED FROM US. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO YOUR ORDER WILL NOT EXCEED THE AMOUNT YOU PAID FOR THE PRODUCT(S) GIVING RISE TO THE CLAIM. Some states do not allow these limitations, so they may not apply to you.</p>
      </LegalSection>

      <LegalSection heading="11. Dispute Resolution &amp; Arbitration">
        <p>We&apos;d like to resolve any concerns directly — please contact us first at <a href="mailto:support@baruashop.com">support@baruashop.com</a>. If a dispute can&apos;t be resolved informally, you and Baruashop agree that it will be resolved through binding individual arbitration rather than in court, except that either party may bring an individual claim in small claims court. You and Baruashop each waive the right to a jury trial and to participate in a class action. This arbitration provision does not apply where prohibited by law.</p>
      </LegalSection>

      <LegalSection heading="12. Governing Law">
        <p>These Terms are governed by the laws of the State of [State], without regard to conflict-of-law principles, except where superseded by federal law.</p>
      </LegalSection>

      <LegalSection heading="13. Changes to These Terms">
        <p>We may update these Terms from time to time. Continued use of the site after changes take effect constitutes acceptance of the revised Terms. We&apos;ll update the &ldquo;Last updated&rdquo; date above when we do.</p>
      </LegalSection>

      <LegalSection heading="14. Contact">
        <p>Questions about these Terms? Contact us at <a href="mailto:support@baruashop.com">support@baruashop.com</a> or visit our <Link href="/help">Contact Information</Link> page.</p>
      </LegalSection>
    </LegalPage>
  );
}
