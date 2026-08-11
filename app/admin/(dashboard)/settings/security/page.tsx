import type { Metadata } from "next";
import { CurrentBehaviour } from "@/components/admin/settings/current-behaviour";
import { ApiKeysList } from "@/components/admin/settings/api-keys-list";
import { getApiKeys } from "@/lib/admin/api-keys";

export const metadata: Metadata = { title: "Security & API" };

/**
 * The "Require two-factor authentication" switch was shown enabled and 2FA
 * has never existed anywhere in this codebase — the single most misleading
 * control in the admin, since it described a protection the store did not
 * have. The session timeout select was equally inert: sessions are Auth.js
 * JWTs on their default lifetime.
 *
 * The API keys list below is real and untouched.
 */
export default async function AdminSecuritySettingsPage() {
  const apiKeys = await getApiKeys();

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <CurrentBehaviour
        title="How admin access is protected today"
        description="Read-only — none of this is configurable from the admin yet."
        rows={[
          {
            label: "Sign-in",
            value: "Email + password",
            state: "on",
            detail: "Passwords are bcrypt-hashed; sign-in attempts are rate-limited.",
          },
          {
            label: "Two-factor authentication",
            value: "Not available",
            state: "attention",
            detail: "There is no second factor. A leaked password is enough to reach the admin.",
          },
          {
            label: "Sessions",
            value: "JWT, 30 days",
            state: "on",
            detail: "Auth.js default lifetime — there's no shorter timeout to set.",
          },
          {
            label: "Roles & permissions",
            value: "Enforced",
            state: "on",
            detail: "Checked server-side on every action, not just hidden in the UI.",
          },
          {
            label: "Password changes",
            value: "Self-service",
            state: "on",
            detail: "Under Users & Permissions — requires the current password.",
          },
        ]}
        link={{ href: "/admin/settings/users", label: "Users & Permissions" }}
        footnote="With no second factor, the Owner password is the only thing protecting refunds and customer data — worth keeping it unique to this store."
      />

      <ApiKeysList initialKeys={apiKeys} />
    </div>
  );
}
