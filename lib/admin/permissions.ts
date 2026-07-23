import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rolePermissions as rolePermissionsTable, adminUserPermissionOverrides as overridesTable } from "@/db/schema";
import { auth } from "@/auth";
import { permissionForPathname, type AdminPermission, type NonOwnerRole } from "@/lib/admin/permission-constants";

export * from "@/lib/admin/permission-constants";

/**
 * Fresh per-request DB read, not JWT-embedded — a permission change takes
 * effect on the signed-in user's very next request instead of waiting for
 * their session token to refresh.
 */
export async function getEffectivePermissions(adminUserId: string, role: NonOwnerRole): Promise<Set<AdminPermission>> {
  const [roleRows, overrideRows] = await Promise.all([
    db.select({ permission: rolePermissionsTable.permission }).from(rolePermissionsTable).where(eq(rolePermissionsTable.role, role)),
    db
      .select({ permission: overridesTable.permission, granted: overridesTable.granted })
      .from(overridesTable)
      .where(eq(overridesTable.adminUserId, adminUserId)),
  ]);

  const permissions = new Set<AdminPermission>(roleRows.map((r) => r.permission));
  for (const override of overrideRows) {
    if (override.granted) permissions.add(override.permission);
    else permissions.delete(override.permission);
  }
  return permissions;
}

/** Central access check for app/admin/(dashboard)/layout.tsx. */
export async function hasAdminAccess(user: { id: string; adminRole?: string }, pathname: string): Promise<boolean> {
  const permission = permissionForPathname(pathname);
  if (!permission) return true;
  if (user.adminRole === "Owner") return true;
  if (!user.adminRole) return false;

  const permissions = await getEffectivePermissions(user.id, user.adminRole as NonOwnerRole);
  return permissions.has(permission);
}

/** Guard for server actions — returns null when allowed, otherwise the `{error}` to return directly from the caller: `const guard = await requirePermission("settings"); if (guard) return guard;` */
export async function requirePermission(permission: AdminPermission): Promise<{ error: string } | null> {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Not authorized" };
  if (session.user.adminRole === "Owner") return null;
  if (!session.user.adminRole) return { error: "Not authorized" };

  const permissions = await getEffectivePermissions(session.user.id, session.user.adminRole as NonOwnerRole);
  if (!permissions.has(permission)) return { error: "You don't have permission to do this" };
  return null;
}

/** Owner-only guard, for the permission system's own mutations and other actions too sensitive to leave to a governable permission (granting roles, deleting other staff). */
export async function requireOwner(): Promise<{ error: string } | null> {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Not authorized" };
  if (session.user.adminRole !== "Owner") return { error: "Only the Owner can do this" };
  return null;
}
