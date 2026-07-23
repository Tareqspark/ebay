"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { rolePermissions, adminUserPermissionOverrides } from "@/db/schema";
import { newId } from "@/lib/id";
import { requireOwner, PERMISSION_LABELS, type AdminPermission, type NonOwnerRole } from "@/lib/admin/permissions";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";

export interface PermissionActionResult {
  error?: string;
}

/**
 * Owner-only by design, not merely "settings"-permission-gated — the
 * permission system governing every other section can't be one of the
 * sections it governs, or an Admin with "settings" access could grant
 * themselves anything.
 */
export async function setRolePermissionAction(role: NonOwnerRole, permission: AdminPermission, granted: boolean): Promise<PermissionActionResult> {
  const guard = await requireOwner();
  if (guard) return guard;

  if (granted) {
    const [existing] = await db
      .select()
      .from(rolePermissions)
      .where(and(eq(rolePermissions.role, role), eq(rolePermissions.permission, permission)))
      .limit(1);
    if (!existing) {
      await db.insert(rolePermissions).values({ id: newId(), role, permission });
    }
  } else {
    await db.delete(rolePermissions).where(and(eq(rolePermissions.role, role), eq(rolePermissions.permission, permission)));
  }

  const actor = await getAdminActorName();
  await logActivity("system", `${role} role ${granted ? "granted" : "revoked"} "${PERMISSION_LABELS[permission]}" access`, actor);
  revalidatePath("/admin/settings/users");
  return {};
}

export async function setUserPermissionOverrideAction(
  adminUserId: string,
  userName: string,
  permission: AdminPermission,
  value: "default" | "grant" | "deny"
): Promise<PermissionActionResult> {
  const guard = await requireOwner();
  if (guard) return guard;

  await db
    .delete(adminUserPermissionOverrides)
    .where(and(eq(adminUserPermissionOverrides.adminUserId, adminUserId), eq(adminUserPermissionOverrides.permission, permission)));
  if (value !== "default") {
    await db.insert(adminUserPermissionOverrides).values({ id: newId(), adminUserId, permission, granted: value === "grant" });
  }

  const actor = await getAdminActorName();
  const label = PERMISSION_LABELS[permission];
  const description = value === "default" ? "reset to role default" : value === "grant" ? "granted" : "denied";
  await logActivity("system", `"${label}" access for ${userName} ${description}`, actor);
  revalidatePath("/admin/settings/users");
  return {};
}
