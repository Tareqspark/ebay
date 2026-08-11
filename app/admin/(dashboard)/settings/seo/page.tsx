import type { Metadata } from "next";
import { CurrentBehaviour } from "@/components/admin/settings/current-behaviour";

export const metadata: Metadata = { title: "SEO & Domains" };

/**
 * The meta title and description were editable inputs that saved nothing,
 * and the domain list included a subdomain that was never set up. Both are
 * shown read-only now, sourced from where they're genuinely defined.
 */
export default function AdminSeoSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <CurrentBehaviour
        title="Search metadata"
        description="Read-only — set in code, not the admin."
        rows={[
          {
            label: "Default title",
            value: "In app/layout.tsx",
            state: "on",
            detail: "Cartebay — Shop Electronics, Home, Fashion & More",
          },
          {
            label: "Per-page titles",
            value: "Automatic",
            state: "on",
            detail: "Category, product and collection pages set their own from their own data.",
          },
          {
            label: "Editable descriptions",
            value: "Not implemented",
            state: "off",
            detail: "Changing copy means a code change and a deploy.",
          },
        ]}
      />

      <CurrentBehaviour
        title="Domains"
        description="Read-only — managed in DNS and the server's nginx config, not here."
        rows={[
          { label: "www.cartebay.com", value: "Serving", state: "on" },
          {
            label: "cartebay.com",
            value: "Not resolving",
            state: "attention",
            detail:
              "The bare domain has no DNS record, so typing it fails. Browsers hide the www. prefix, which makes it look like it works.",
          },
        ]}
        footnote="Pointing the bare domain here needs an A record and a certificate covering both names — a DNS and certbot change on the droplet, not something the admin can do. See google_index.md."
      />
    </div>
  );
}
