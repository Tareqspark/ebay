import { cache } from "react";
import { db } from "@/db";
import { apiKeys as apiKeysTable } from "@/db/schema";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

export const getApiKeys = cache(async (): Promise<ApiKey[]> => {
  const rows = await db.select().from(apiKeysTable);
  return rows.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    scopes: k.scopes,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
  }));
});
