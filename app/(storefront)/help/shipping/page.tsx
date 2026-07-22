import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping Policy"
      updated="July 22, 2026"
      intro="Baruashop currently ships to addresses within the United States, including Alaska, Hawaii, and US territories. Here&rsquo;s what to expect once you place an order."
    >
      <LegalSection heading="1. Processing Time">
        <p>Orders are typically processed within 1–2 business days of payment confirmation. You&apos;ll receive an email as soon as your order ships.</p>
      </LegalSection>

      <LegalSection heading="2. Shipping Costs">
        <ul>
          <li>Standard shipping is <strong>free on orders of $50 or more</strong>.</li>
          <li>Orders under $50 ship for a flat <strong>$6.99</strong>.</li>
          <li>Expedited and overnight options are available at checkout for an additional cost where offered.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Delivery Estimates">
        <p>Baruashop sells two kinds of products, and they ship a little differently:</p>
        <ul>
          <li><strong>Self-stocked items</strong> ship from our own warehouse and typically arrive in <strong>4–6 business days</strong> via standard shipping to the continental US (longer to Alaska, Hawaii, and US territories).</li>
          <li><strong>Supplier-fulfilled items</strong> (noted on the product page) ship directly from our supplier network and typically arrive in <strong>7–20 business days</strong>, depending on the item and warehouse location.</li>
        </ul>
        <p>If your order contains both types of items, they may arrive in separate shipments with separate tracking numbers — this is normal and both are covered under the same order.</p>
      </LegalSection>

      <LegalSection heading="4. Order Tracking">
        <p>Once your order ships, we&apos;ll email you a tracking number. You can also view tracking any time from <Link href="/account/orders">My Orders</Link> or our <Link href="/track-order">Track Your Order</Link> page.</p>
      </LegalSection>

      <LegalSection heading="5. Delivery Address">
        <p>Please double-check your shipping address at checkout — we&apos;re unable to redirect a package once it has shipped. If you notice an error immediately after placing your order, contact us right away at <a href="mailto:support@baruashop.com">support@baruashop.com</a> and we&apos;ll do our best to correct it before it ships.</p>
      </LegalSection>

      <LegalSection heading="6. Delays">
        <p>Delivery estimates are our best expectation, not a guarantee — carrier delays, weather, customs holds (for supplier-fulfilled items), and high-demand periods can occasionally push delivery beyond the estimated window. If your order is significantly delayed, contact us and we&apos;ll look into it.</p>
      </LegalSection>

      <LegalSection heading="7. Lost or Stolen Packages">
        <p>If tracking shows your package as delivered but you haven&apos;t received it, please check with neighbors and your building&apos;s front desk/mailroom first, then contact us within 7 days at <a href="mailto:support@baruashop.com">support@baruashop.com</a> so we can investigate with the carrier and make it right.</p>
      </LegalSection>

      <LegalSection heading="8. Questions">
        <p>See our <Link href="/help/returns">Refund Policy</Link> for returns, or reach us any time at <a href="mailto:support@baruashop.com">support@baruashop.com</a>.</p>
      </LegalSection>
    </LegalPage>
  );
}
