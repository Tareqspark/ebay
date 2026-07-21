import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/account/sign-in-form";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Sign in to Baruashop</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back — access your orders and saved details.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
