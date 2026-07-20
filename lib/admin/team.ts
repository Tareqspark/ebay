export type AdminRole = "Owner" | "Admin" | "Merchandiser" | "Support" | "Catalog Manager";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "invited";
  lastActiveAt: string;
}

export const ADMIN_TEAM: AdminUser[] = [
  { id: "u-1", name: "Priya Patel", email: "priya@baruashop.com", role: "Owner", status: "active", lastActiveAt: "2026-07-19T13:00:00Z" },
  { id: "u-2", name: "Marcus Chen", email: "marcus@baruashop.com", role: "Admin", status: "active", lastActiveAt: "2026-07-19T10:30:00Z" },
  { id: "u-3", name: "Sofia Ricci", email: "sofia@baruashop.com", role: "Merchandiser", status: "active", lastActiveAt: "2026-07-18T16:45:00Z" },
  { id: "u-4", name: "Daniel Osei", email: "daniel@baruashop.com", role: "Catalog Manager", status: "active", lastActiveAt: "2026-07-19T08:15:00Z" },
  { id: "u-5", name: "Grace Kim", email: "grace@baruashop.com", role: "Support", status: "active", lastActiveAt: "2026-07-19T11:20:00Z" },
  { id: "u-6", name: "Elena Vargas", email: "elena@baruashop.com", role: "Support", status: "invited", lastActiveAt: "2026-07-17T09:00:00Z" },
];
