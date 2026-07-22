import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}

/** Shared shell for the long-form policy pages (Privacy, Terms, Shipping, Refunds, Legal Notice) — consistent typography and width so they read as one family of documents. */
export function LegalPage({ title, updated, intro, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
      {intro && <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
      <div className="legal-prose mt-8">{children}</div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
      <div className="mt-2.5 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
