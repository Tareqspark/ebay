import { cache } from "react";
import { db } from "@/db";
import { contentItems as contentItemsTable } from "@/db/schema";

export type ContentType = "page" | "banner" | "hero_slide";
export type ContentStatus = "published" | "draft";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  location: string;
  status: ContentStatus;
  updatedAt: string;
}

export const getContentItems = cache(async (): Promise<ContentItem[]> => {
  const rows = await db.select().from(contentItemsTable);
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    location: c.location,
    status: c.status,
    updatedAt: c.updatedAt.toISOString(),
  }));
});
