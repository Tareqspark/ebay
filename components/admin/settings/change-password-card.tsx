"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeOwnPasswordAction } from "@/lib/admin/team-actions";

/**
 * Changes the signed-in staff member's own password.
 *
 * The current password is asked for even though they are already signed in:
 * a session left open on a shared machine would otherwise be enough for
 * someone to lock the real account holder out.
 */
export function ChangePasswordCard({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Mirrors the server's rules so the problem is visible while typing rather
  // than only after a round trip. The server still enforces all of it.
  const tooShort = next.length > 0 && next.length < 10;
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit = current.length > 0 && next.length >= 10 && next === confirm && !pending;

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await changeOwnPasswordAction(current, next, confirm);
        if (result.error) {
          setError(result.error);
          return;
        }
        toast.success("Password changed — it takes effect the next time you sign in.");
        setCurrent("");
        setNext("");
        setConfirm("");
      } catch {
        setError("Couldn't change the password — please try again.");
      }
    });
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-1 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Change your password</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Signed in as {email}. This changes only your own password.
      </p>

      <div className="flex max-w-md flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pw-current">Current password</Label>
          <Input
            id="pw-current"
            type={reveal ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pw-new">New password</Label>
          <Input
            id="pw-new"
            type={reveal ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            aria-invalid={tooShort || undefined}
          />
          <p className={tooShort ? "text-xs text-error" : "text-xs text-muted-foreground"}>
            At least 10 characters.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pw-confirm">Repeat new password</Label>
          <Input
            id="pw-confirm"
            type={reveal ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            aria-invalid={mismatch || undefined}
          />
          {mismatch && <p className="text-xs text-error">The two passwords don&apos;t match.</p>}
        </div>

        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          className="flex items-center gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground"
        >
          {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {reveal ? "Hide" : "Show"} passwords
        </button>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button className="self-start" disabled={!canSubmit} onClick={submit}>
          {pending ? "Changing..." : "Change password"}
        </Button>
      </div>
    </section>
  );
}
