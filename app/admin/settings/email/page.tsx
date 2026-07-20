import type { Metadata } from "next";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = { title: "Email Settings" };

export default function AdminEmailSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <SettingsSection title="Sender details" description="How transactional emails appear to customers">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Sender name</Label>
            <Input defaultValue="Baruashop" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Sender email</Label>
            <Input defaultValue="orders@baruashop.com" type="email" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Email footer" description="Appended to every transactional email">
        <Textarea
          defaultValue={"Baruashop Commerce, Inc. — 500 Market Street, Wilmington, DE 19801\nQuestions? Reply to this email or visit our Help Center."}
          rows={4}
        />
      </SettingsSection>
    </div>
  );
}
