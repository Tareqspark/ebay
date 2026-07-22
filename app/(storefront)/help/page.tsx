import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, MapPin, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/help/contact-form";

export const metadata: Metadata = { title: "Contact Information" };

export default function ContactInformationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Information</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Have a question about an order, a return, or a product? We&apos;re happy to help — reach us any of the ways
        below, or send us a message directly.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Email</p>
            <a href="mailto:support@baruashop.com" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
              support@baruashop.com
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Support hours</p>
            <p className="text-sm text-muted-foreground">Monday–Friday, 9am–6pm ET</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Mailing address</p>
            <p className="text-sm text-muted-foreground">[Business Address]</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Other help topics</p>
            <p className="text-sm text-muted-foreground">
              <Link href="/help/shipping" className="hover:text-foreground hover:underline">Shipping</Link>
              {" · "}
              <Link href="/help/returns" className="hover:text-foreground hover:underline">Returns</Link>
              {" · "}
              <Link href="/track-order" className="hover:text-foreground hover:underline">Track an order</Link>
            </p>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-foreground">Send us a message</h2>
      <div className="mt-3">
        <ContactForm />
      </div>
    </div>
  );
}
