import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

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
