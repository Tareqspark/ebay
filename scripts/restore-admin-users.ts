/**
 * One-time recovery script: restores admin_users after it was accidentally
 * wiped by a drizzle-kit push enum-widening statement. Only touches
 * admin_users, and only if it's currently empty — safe to leave around
 * but not meant to be part of the normal seed flow (see scripts/seed-db.ts).
 */
import { hash } from "bcryptjs";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";
import { ADMIN_TEAM } from "./seed-admin-extras";

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

async function main() {
  const existing = await db.select().from(schema.adminUsers);
  if (existing.length > 0) {
    console.log(`admin_users already has ${existing.length} rows — not touching it.`);
    process.exit(0);
  }

  const seedPasswordHash = await hash("baruashop-dev-2026", 10);
  await db.insert(schema.adminUsers).values(
    ADMIN_TEAM.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      passwordHash: seedPasswordHash,
      role: a.role,
      status: a.status,
      lastActiveAt: new Date(a.lastActiveAt),
    }))
  );

  const after = await db.select().from(schema.adminUsers);
  console.log(`Restored ${after.length} admin_users rows.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
