import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";

/**
 * Defense-in-depth check for Server Components under app/admin/(dashboard) —
 * middleware.ts already redirects unauthenticated/non-staff requests before
 * they reach here, but this also hands back the session so layouts/pages can
 * render the signed-in staff member's name/role.
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/admin/login");
  }
  return session;
}

/** For admin server actions: the signed-in staff member's display name, for activity-log "actor" fields. Falls back to "Staff" if somehow called outside an admin session (shouldn't happen — middleware already gates /admin). */
export async function getAdminActorName(): Promise<string> {
  const session = await auth();
  return session?.user?.name ?? "Staff";
}

/**
 * The signed-in admin's current name and email, straight from the database.
 *
 * The session carries whatever these were when the JWT was minted, so a
 * rename stays invisible on screen until that staff member next signs out —
 * which is exactly the confusion it caused. Cheap enough to read per request:
 * the admin layout already queries for permissions on every page.
 */
export const getAdminIdentity = cache(async (adminUserId: string): Promise<{ name: string; email: string } | null> => {
  const [row] = await db
    .select({ name: adminUsers.name, email: adminUsers.email })
    .from(adminUsers)
    .where(eq(adminUsers.id, adminUserId))
    .limit(1);
  return row ?? null;
});
