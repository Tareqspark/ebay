"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, type AuthActionState } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

// Shown when the user was sent here from a protected page rather than
// arriving directly — without this, a signed-out (or session-expired)
// visitor who clicks something like Checkout lands on the exact same
// generic "Welcome back" copy as anyone else, with nothing indicating
// this page is a consequence of their click. Reported live as "the
// checkout button does nothing": the button did work, it silently
// redirected here, and the lack of context made that redirect unreadable.
const REDIRECT_REASONS: Record<string, string> = {
  "/checkout": "Sign in to continue to checkout.",
};

export function SignInForm() {
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = rawNext ?? "/account";
  const redirectReason = rawNext ? (REDIRECT_REASONS[rawNext] ?? "Sign in to continue.") : null;
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirectReason && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">{redirectReason}</p>
      )}
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/account/sign-up" className="font-medium text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
