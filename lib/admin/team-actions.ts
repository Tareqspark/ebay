"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { db } from "@/db";
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
