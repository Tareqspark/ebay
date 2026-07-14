"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-12 sm:py-14">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
          <Mail className="h-6 w-6" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Stay in the loop</h2>
        <p className="mt-2 text-sm text-primary-foreground/85 sm:text-base">
          Sign up for exclusive deals, new arrivals, and early access to sales — straight to your inbox.
        </p>

        {submitted ? (
          <div className="mt-6 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            You&apos;re subscribed! Watch your inbox for deals.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              suppressHydrationWarning
              className="h-11 flex-1 rounded-lg border-0 bg-white px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-white/50"
            />
            <Button type="submit" size="lg" variant="secondary" className="h-11 shrink-0">
              Subscribe
            </Button>
          </form>
        )}
        <p className="mt-3 text-xs text-primary-foreground/70">
          By subscribing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </section>
  );
}
