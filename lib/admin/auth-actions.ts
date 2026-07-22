"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
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

  const session = await auth();
  if (!session?.user?.isAdmin) {
    await signOut({ redirect: false });
    return { error: "This account doesn't have admin access" };
  }

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin");
}

export async function adminSignOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
