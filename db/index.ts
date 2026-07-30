import "server-only";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/db/schema";

declare global {
  var __cartebayPool: mysql.Pool | undefined;
}

const pool =
  global.__cartebayPool ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__cartebayPool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
