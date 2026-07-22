"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendContactMessageAction } from "@/lib/contact-actions";
import type { ContactFormState } from "@/lib/contact-actions";

const initialState: ContactFormState = {};

const topicItems: Record<string, string> = {
  "Order question": "Order question",
  "Return or refund": "Return or refund",
  "Shipping question": "Shipping question",
  "Product question": "Product question",
  Other: "Other",
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendContactMessageAction, initialState);
  const [topic, setTopic] = useState("Order question");
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) setFormKey((k) => k + 1);
  }, [state.success]);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-6 py-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        <p className="font-medium text-foreground">Message sent</p>
        <p className="text-sm text-muted-foreground">
          Thanks for reaching out — we typically reply within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <input type="hidden" name="topic" value={topic} />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" name="name" required placeholder="Your name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" name="email" type="email" required placeholder="you@example.com" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Topic</Label>
        <Select value={topic} onValueChange={(v) => v && setTopic(v)} items={topicItems}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(topicItems).map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" required rows={5} placeholder="How can we help?" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
