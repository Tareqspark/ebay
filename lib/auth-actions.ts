"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { newId } from "@/lib/id";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { mergeGuestCartIntoUser } from "@/lib/cart";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(191),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface AuthActionState {
  error?: string;
}

export async function signUpAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password } = parsed.data;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hash(password, 10);
  const id = newId();
  await db.insert(users).values({ id, name, email, passwordHash });

  return signInAction(_prevState, formData);
}

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function signInAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
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

  await mergeGuestCartIntoUser();

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/account");
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
