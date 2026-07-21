import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "@/components/account/sign-up-form";

export const metadata: Metadata = { title: "Create Account" };

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Save orders, addresses, and check out faster.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
