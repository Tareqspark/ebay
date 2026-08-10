"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { db } from "@/db";
import { auth } from "@/auth";
import { isRateLimited, recordAttempt } from "@/lib/rate-limit";
import { adminUsers } from "@/db/schema";
import { newId } from "@/lib/id";
import { getAdminActorName, requireAdminSession } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { checkPlainText } from "@/lib/sanitize";
import { requirePermission, requireOwner } from "@/lib/admin/permissions";
import type { AdminRole, AdminUserStatus } from "@/lib/admin/team";

export interface TeamActionResult {
  error?: string;
  tempPassword?: string;
}

export interface TeamMemberInput {
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
}

function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function inviteTeamMemberAction(input: TeamMemberInput): Promise<TeamActionResult> {
  const guard = await requirePermission("settings");
  if (guard) return guard;
  if (input.role === "Owner") {
    const ownerGuard = await requireOwner();
    if (ownerGuard) return { error: "Only the Owner can grant the Owner role" };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) return { error: "Name is required" };
  if (!email || !email.includes("@")) return { error: "A valid email is required" };
  const textError = checkPlainText(name, "Name");
  if (textError) return { error: textError };

  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing) return { error: "A staff account with this email already exists" };

  const tempPassword = generateTempPassword();
  const passwordHash = await hash(tempPassword, 10);

  await db.insert(adminUsers).values({
    id: newId(),
    name,
    email,
    passwordHash,
    role: input.role,
    status: input.status,
  });

  const actor = await getAdminActorName();
  await logActivity("system", `Staff account "${name}" (${input.role}) invited`, actor);
  revalidatePath("/admin/settings/users");
  return { tempPassword };
}

export async function updateTeamMemberAction(id: string, input: TeamMemberInput): Promise<TeamActionResult> {
  const guard = await requirePermission("settings");
  if (guard) return guard;

  const [target] = await db.select({ role: adminUsers.role }).from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (target?.role === "Owner" || input.role === "Owner") {
    const ownerGuard = await requireOwner();
    if (ownerGuard) return { error: "Only the Owner can change the Owner account or grant the Owner role" };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) return { error: "Name is required" };
  if (!email || !email.includes("@")) return { error: "A valid email is required" };
  const textError = checkPlainText(name, "Name");
  if (textError) return { error: textError };

  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing && existing.id !== id) return { error: "A staff account with this email already exists" };

  await db.update(adminUsers).set({ name, email, role: input.role, status: input.status }).where(eq(adminUsers.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Staff account "${name}" updated`, actor);
  revalidatePath("/admin/settings/users");
  return {};
}

export async function resetTeamMemberPasswordAction(id: string, name: string): Promise<TeamActionResult> {
  const guard = await requirePermission("settings");
  if (guard) return guard;

  const [target] = await db.select({ role: adminUsers.role }).from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (target?.role === "Owner") {
    const ownerGuard = await requireOwner();
    if (ownerGuard) return { error: "Only the Owner can reset the Owner account's password" };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hash(tempPassword, 10);
  await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Password reset for "${name}"`, actor);
  revalidatePath("/admin/settings/users");
  return { tempPassword };
}

export async function deleteTeamMemberAction(id: string, name: string): Promise<TeamActionResult> {
  const guard = await requirePermission("settings");
  if (guard) return guard;

  const session = await requireAdminSession();
  if (session.user.id === id) {
    return { error: "You can't remove your own account" };
  }

  const [target] = await db.select({ role: adminUsers.role }).from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (target?.role === "Owner") {
    const ownerGuard = await requireOwner();
    if (ownerGuard) return { error: "Only the Owner can remove the Owner account" };
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, id));

  const actor = await getAdminActorName();
  await logActivity("system", `Staff account "${name}" removed`, actor);
  revalidatePath("/admin/settings/users");
  return {};
}

export interface PasswordChangeResult {
  error?: string;
  ok?: boolean;
}

/**
 * Lets a signed-in staff member change their own password.
 *
 * The current password is required even though the session already proves who
 * they are: a session can be left open on a shared machine, and without this
 * step anyone reaching an unlocked screen could lock the real owner out of
 * their own account. It is the difference between "is this their browser" and
 * "is this them".
 *
 * Deliberately scoped to the caller's own account rather than taking a user
 * id — resetting someone else's password already exists separately and is
 * Owner-gated, and an action that could target any account would be a much
 * larger thing to get wrong.
 */
export async function changeOwnPasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<PasswordChangeResult> {
  const session = await auth();
  if (!session?.user?.isAdmin || !session.user.id) return { error: "Not authorized" };

  if (newPassword !== confirmPassword) return { error: "The two new passwords don't match" };
  if (newPassword.length < 10) return { error: "Use at least 10 characters" };
  // bcrypt silently truncates beyond 72 bytes, so a longer passphrase would
  // give a false sense of strength.
  if (new TextEncoder().encode(newPassword).length > 72) return { error: "Password is too long — 72 bytes maximum" };
  if (newPassword === currentPassword) return { error: "The new password must differ from the current one" };

  // Throttled per account: without it this endpoint is an oracle for guessing
  // the current password from an already-open session.
  const key = `pwchange:${session.user.id}`;
  if (isRateLimited(key, 5, 15 * 60 * 1000)) {
    return { error: "Too many attempts — try again in a few minutes" };
  }

  const [staff] = await db
    .select({ id: adminUsers.id, passwordHash: adminUsers.passwordHash })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.user.id))
    .limit(1);
  if (!staff) return { error: "Account not found" };

  const valid = await compare(currentPassword, staff.passwordHash);
  if (!valid) {
    recordAttempt(key, 15 * 60 * 1000);
    return { error: "Current password is incorrect" };
  }

  await db.update(adminUsers).set({ passwordHash: await hash(newPassword, 10) }).where(eq(adminUsers.id, staff.id));

  const actor = await getAdminActorName();
  // Recorded, but never the password itself — an audit trail should show that
  // a change happened, not what it changed to.
  await logActivity("system", `${actor} changed their own password`, actor);
  return { ok: true };
}
