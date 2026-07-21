import { cache } from "react";
import { db } from "@/db";
import { adminUsers as adminUsersTable } from "@/db/schema";

export type AdminRole = "Owner" | "Admin" | "Merchandiser" | "Support" | "Catalog Manager";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "invited";
  lastActiveAt: string;
}

export const getAdminTeam = cache(async (): Promise<AdminUser[]> => {
  const rows = await db.select().from(adminUsersTable);
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastActiveAt: u.lastActiveAt.toISOString(),
  }));
});
