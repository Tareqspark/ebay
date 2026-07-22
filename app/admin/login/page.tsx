import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.isAdmin) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Baruashop Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with your staff account.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Suspense>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
