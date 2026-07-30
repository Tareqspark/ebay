import type { ReactNode } from "react";

interface CompanyPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Shared shell for company/marketing pages (About, Careers, Press, Sustainability, Affiliates) — same typographic family as components/legal/legal-page.tsx, but framed as brand content rather than a dated policy document. */
export function CompanyPage({ title, subtitle, children }: CompanyPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
      <div className="company-prose mt-8">{children}</div>
    </div>
  );
}

export function CompanySection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
      <div className="mt-2.5 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
