import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="July 22, 2026"
      intro="We want you to be happy with your purchase. This policy explains how returns, exchanges, and refunds work at Baruashop."
    >
      <LegalSection heading="1. Return Window">
        <p>Most items can be returned within <strong>30 days</strong> of delivery for a full refund. To be eligible, an item must be unused, in its original condition, and in its original packaging with all tags and accessories included.</p>
      </LegalSection>

      <LegalSection heading="2. How to Start a Return">
        <ol className="[&>li]:ml-5 [&>li]:list-decimal">
          <li>Go to <Link href="/account/orders">My Orders</Link> and find the order you&apos;d like to return.</li>
          <li>Contact us at <a href="mailto:returns@baruashop.com">returns@baruashop.com</a> with your order number and the item(s) you&apos;d like to return.</li>
          <li>We&apos;ll email you return instructions, and a prepaid return label where applicable.</li>
          <li>Pack the item securely and ship it back within 14 days of receiving your return instructions.</li>
        </ol>
      </LegalSection>

      <LegalSection heading="3. Refunds">
        <p>Once we receive and inspect your return, we&apos;ll process your refund to your original payment method, typically within 5–10 business days. You&apos;ll receive an email confirmation once your refund is issued. Original shipping charges are non-refundable except where the return is due to our error (wrong, damaged, or defective item).</p>
      </LegalSection>

      <LegalSection heading="4. Damaged, Defective, or Incorrect Items">
        <p>If an item arrives damaged, defective, or different from what you ordered, contact us within 7 days of delivery at <a href="mailto:returns@baruashop.com">returns@baruashop.com</a> with photos of the issue. We&apos;ll arrange a full refund or free replacement — no return shipping cost to you, and no restocking fee.</p>
      </LegalSection>

      <LegalSection heading="5. Items Fulfilled Through Our Supplier Network">
        <p>Some items on Baruashop are shipped directly from our supplier network rather than our own warehouse (this is noted on the product page). Returns for these items follow the same 30-day window and process above, but may take a few extra days to process since the return is coordinated with the supplier. Damaged, defective, or lost supplier-fulfilled items are covered the same way as item 4 above.</p>
      </LegalSection>

      <LegalSection heading="6. Non-Returnable Items">
        <ul>
          <li>Items marked &ldquo;Final Sale&rdquo; on the product page</li>
          <li>Gift cards</li>
          <li>Personalized or made-to-order items</li>
          <li>Items returned without their original packaging or missing accessories</li>
        </ul>
      </LegalSection>

      <LegalSection heading="7. Exchanges">
        <p>We don&apos;t currently process direct exchanges. If you&apos;d like a different size, color, or item, return your original item for a refund and place a new order.</p>
      </LegalSection>

      <LegalSection heading="8. Questions">
        <p>Reach our support team any time at <a href="mailto:returns@baruashop.com">returns@baruashop.com</a>, or visit our <Link href="/help">Contact Information</Link> page.</p>
      </LegalSection>
    </LegalPage>
  );
}
