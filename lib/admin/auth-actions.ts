"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import type { AuthActionState } from "@/lib/auth-actions";

const adminSignInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function adminSignInAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = adminSignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Incorrect email or password" };
    }
    throw err;
  }

  // Not `await auth()` — Next.js/Auth.js memoize the session read per
  // request, so a second call this soon after signIn() (same Server Action
  // invocation) returns the cached PRE-login result rather than the session
  // that was just established, making this check fail for every real staff
  // account (verified live: a real Owner login was rejected with "This
  // account doesn't have admin access" despite authorize() approving the
  // credentials correctly). A fresh, uncached DB read sidesteps the cache
  // entirely — signIn() above already proved the password is correct for
  // this email, so the only remaining question is whether that account is
  // active staff.
  const [staff] = await db.select({ status: adminUsers.status }).from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  if (!staff || staff.status !== "active") {
    await signOut({ redirect: false });
    return { error: "This account doesn't have admin access" };
  }

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin");
}

export async function adminSignOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
