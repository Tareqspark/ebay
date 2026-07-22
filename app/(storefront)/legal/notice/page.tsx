import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Legal Notice" };

export default function LegalNoticePage() {
  return (
    <LegalPage title="Legal Notice" updated="July 22, 2026">
      <LegalSection heading="1. Site Operator">
        <p>
          This website, baruashop.com, is operated by Baruashop.
          <br />
          Business address: [Business Address]
          <br />
          Phone: [Support Phone Number]
          <br />
          Email: <a href="mailto:legal@baruashop.com">legal@baruashop.com</a>
        </p>
      </LegalSection>

      <LegalSection heading="2. Purpose of This Page">
        <p>This Legal Notice provides required disclosures about who operates this site and how to reach us. It works alongside, and does not replace, our <Link href="/legal/privacy">Privacy Policy</Link> and <Link href="/legal/terms">Terms of Service</Link>.</p>
      </LegalSection>

      <LegalSection heading="3. Intellectual Property">
        <p>All trademarks, logos, product names, and original content on this site are the property of Baruashop or their respective owners. Product images not belonging to Baruashop are used under license or with permission from our suppliers and brand partners.</p>
      </LegalSection>

      <LegalSection heading="4. Accuracy of Information">
        <p>We make reasonable efforts to keep product information, pricing, and availability accurate and up to date, but errors can occur. We reserve the right to correct any errors and to cancel or decline orders affected by them, as described in our <Link href="/legal/terms">Terms of Service</Link>.</p>
      </LegalSection>

      <LegalSection heading="5. External Links">
        <p>Our site may link to third-party websites we don&apos;t control or operate. We&apos;re not responsible for the content, accuracy, or practices of any linked third-party site.</p>
      </LegalSection>

      <LegalSection heading="6. Copyright Infringement Notices (DMCA)">
        <p>If you believe content on this site infringes your copyright, please send a notice to our designated agent that includes: (1) a description of the copyrighted work; (2) the location of the allegedly infringing material on our site; (3) your contact information; (4) a statement that you have a good-faith belief the use is unauthorized; and (5) a statement, under penalty of perjury, that the information is accurate and you&apos;re authorized to act on the copyright owner&apos;s behalf.</p>
        <p>
          Designated Agent for Copyright Notices:
          <br />
          Baruashop Legal Department
          <br />
          Email: <a href="mailto:legal@baruashop.com">legal@baruashop.com</a>
          <br />
          Address: [Business Address]
        </p>
      </LegalSection>

      <LegalSection heading="7. Governing Law">
        <p>This Legal Notice is governed by the laws of the State of [State], consistent with our <Link href="/legal/terms">Terms of Service</Link>.</p>
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>For legal inquiries, contact <a href="mailto:legal@baruashop.com">legal@baruashop.com</a>. For general support, visit our <Link href="/help">Contact Information</Link> page.</p>
      </LegalSection>
    </LegalPage>
  );
}
