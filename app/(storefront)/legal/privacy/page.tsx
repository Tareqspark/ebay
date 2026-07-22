import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 22, 2026"
      intro="This Privacy Policy explains what personal information Baruashop collects, how we use it, and the choices and rights you have. It applies to baruashop.com and any Baruashop account, order, or communication with us."
    >
      <LegalSection heading="1. Information We Collect">
        <p><strong>Information you give us directly</strong> — when you create an account, place an order, contact support, or leave a product review:</p>
        <ul>
          <li>Name, email address, and password (stored as a secure hash — we never store or have access to your plain-text password)</li>
          <li>Shipping and billing address, phone number</li>
          <li>Order history and the products you purchase</li>
          <li>Product reviews and any content you submit</li>
          <li>Messages you send to customer support</li>
        </ul>
        <p><strong>Payment information.</strong> Card numbers and other payment details are entered directly into Stripe, our payment processor, and never pass through or get stored on Baruashop&apos;s own servers. We retain only a payment confirmation and the last four digits of your card for your order history.</p>
        <p><strong>Information collected automatically.</strong> Like most websites, we and our service providers automatically collect certain information when you visit, including your IP address, browser and device type, pages viewed, and referring pages, typically through cookies and similar technologies.</p>
      </LegalSection>

      <LegalSection heading="2. How We Use Your Information">
        <ul>
          <li>Process and fulfill your orders, including sharing your shipping address with the carrier or supplier fulfilling your order</li>
          <li>Create and maintain your account</li>
          <li>Send order confirmations, shipping updates, and other transactional communications</li>
          <li>Respond to customer service requests</li>
          <li>Send marketing communications, where you&apos;ve opted in — you can unsubscribe at any time using the link in any marketing email</li>
          <li>Detect and prevent fraud, abuse, and security incidents</li>
          <li>Improve our site, products, and customer experience</li>
          <li>Comply with legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Who We Share Information With">
        <p>We do not sell your personal information. We share information only as needed to run the business:</p>
        <ul>
          <li><strong>Payment processing</strong> — Stripe, to process your payment securely</li>
          <li><strong>Order fulfillment</strong> — for products shipped by Baruashop directly, our carriers (e.g. UPS, USPS); for products dropshipped through our supplier network, the relevant supplier (e.g. CJdropshipping), who receives the shipping information needed to fulfill and ship your order</li>
          <li><strong>Email delivery</strong> — SendGrid, to deliver order confirmations and account emails</li>
          <li><strong>Legal &amp; safety</strong> — when required to comply with law, enforce our Terms of Service, or protect the rights, property, or safety of Baruashop, our customers, or others</li>
          <li><strong>Business transfers</strong> — in connection with a merger, acquisition, or sale of assets, subject to standard confidentiality protections</li>
        </ul>
        <p>Some of our suppliers ship internationally, which may mean your shipping information is processed outside the United States solely for the purpose of fulfilling your order.</p>
      </LegalSection>

      <LegalSection heading="4. Cookies &amp; Tracking Technologies">
        <p>We use cookies and similar technologies to keep you signed in, remember your cart and recently viewed items, and understand how our site is used. You can control cookies through your browser settings; disabling them may affect site functionality like staying signed in or keeping items in your cart.</p>
      </LegalSection>

      <LegalSection heading="5. Data Retention">
        <p>We retain account and order information for as long as your account is active and as needed to comply with our legal and tax obligations, resolve disputes, and enforce our agreements. You may request deletion of your account as described below.</p>
      </LegalSection>

      <LegalSection heading="6. Your Privacy Rights">
        <p>You can access, update, or delete much of your information directly from your <Link href="/account">account settings</Link>. You may also contact us at <a href="mailto:privacy@baruashop.com">privacy@baruashop.com</a> to request access to, correction of, or deletion of your personal information.</p>
        <p><strong>California residents (CCPA/CPRA).</strong> If you are a California resident, you have the right to know what personal information we collect, request deletion of it, correct inaccurate information, and opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information. Baruashop does not sell your personal information and does not share it for cross-context behavioral advertising. To exercise these rights, contact us at the email above; we will not discriminate against you for exercising them.</p>
        <p><strong>Other states.</strong> Depending on your state of residence, you may have similar rights under state privacy laws (for example Virginia, Colorado, Connecticut, or Utah). Contact us and we will honor applicable requests.</p>
      </LegalSection>

      <LegalSection heading="7. Children&rsquo;s Privacy">
        <p>Baruashop is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it.</p>
      </LegalSection>

      <LegalSection heading="8. Data Security">
        <p>We use industry-standard safeguards to protect your information, including password hashing and encrypted payment processing through Stripe. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
      </LegalSection>

      <LegalSection heading="9. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. If we make material changes, we&apos;ll update the &ldquo;Last updated&rdquo; date above and, where appropriate, notify you directly.</p>
      </LegalSection>

      <LegalSection heading="10. Contact Us">
        <p>Questions about this policy or your personal information? Reach us at <a href="mailto:privacy@baruashop.com">privacy@baruashop.com</a> or visit our <Link href="/help">Contact Information</Link> page.</p>
      </LegalSection>
    </LegalPage>
  );
}
