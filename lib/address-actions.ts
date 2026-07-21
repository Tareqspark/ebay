"use server";

import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { newId } from "@/lib/id";
import { auth } from "@/auth";

const addressSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(191),
  line1: z.string().trim().min(1, "Address is required").max(191),
  line2: z.string().trim().max(191).optional(),
  city: z.string().trim().min(1, "City is required").max(120),
  state: z.string().trim().min(1, "State is required").max(60),
  zip: z.string().trim().min(1, "ZIP is required").max(20),
  country: z.string().trim().min(1).max(60).default("US"),
});

export interface AddressActionState {
  error?: string;
}

export async function getAddressesForCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return db.select().from(addresses).where(eq(addresses.userId, session.user.id)).orderBy(desc(addresses.isDefault));
}

export async function addAddressAction(_prevState: AddressActionState, formData: FormData): Promise<AddressActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in" };

  const parsed = addressSchema.safeParse({
    name: formData.get("name"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    country: formData.get("country") || "US",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const existing = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, session.user.id));
  await db.insert(addresses).values({
    id: newId(),
    userId: session.user.id,
    ...parsed.data,
    isDefault: existing.length === 0,
  });

  revalidatePath("/account/addresses");
  return {};
}

export async function deleteAddressAction(addressId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await db.delete(addresses).where(and(eq(addresses.id, addressId), eq(addresses.userId, session.user.id)));
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, session.user.id));
  await db.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, addressId), eq(addresses.userId, session.user.id)));
  revalidatePath("/account/addresses");
}
