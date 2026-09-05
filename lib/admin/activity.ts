import "server-only";
import { db } from "@/db";
import { activityEvents } from "@/db/schema";
import { newId } from "@/lib/id";
import type { ActivityType } from "@/lib/admin/types";

/**
 * Real audit-log write, called from checkout (customer-facing) and every
 * admin mutation server action. `actor` is a human label — the signed-in
 * staff member's name for admin actions, "Storefront" for customer-driven
 * events like a new order. Fire-and-forget from the caller's perspective:
 * failures are logged but never thrown, since a broken audit write should
 * never fail the mutation it's describing.
 */
export async function logActivity(
  type: ActivityType,
  message: string,
  actor: string,
  /** The row this is about, so its history survives a rename. */
  entityId?: string,
  /** Before and after for each field the action changed — see diffFields. */
  changes?: FieldChanges
): Promise<void> {
  try {
    await db.insert(activityEvents).values({
      id: newId(),
      type,
      message,
      actor,
      entityId: entityId ?? null,
      changes: changes && Object.keys(changes).length > 0 ? changes : null,
    });
  } catch (err) {
    console.error("[activity] failed to write audit log entry", { type, message, actor }, err);
  }
}

export type FieldChanges = Record<string, { from: string | null; to: string | null }>;

/**
 * A description can run to 2,000 characters, and storing both sides in full
 * would put two copies of every one into the log. Long values are cut, with
 * the original length kept so it is clear something was trimmed rather than
 * the value having been that short.
 */
const MAX_LOGGED_VALUE = 200;
function forLog(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value);
  return s.length <= MAX_LOGGED_VALUE ? s : `${s.slice(0, MAX_LOGGED_VALUE)}… (${s.length} chars)`;
}

/**
 * The fields that actually changed, ignoring the ones that were merely
 * resubmitted unchanged — a form posts every field whether or not it was
 * touched, and logging all of them would bury the real edit.
 */
export function diffFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): FieldChanges {
  const changes: FieldChanges = {};
  for (const key of Object.keys(after)) {
    const from = before[key];
    const to = after[key];
    // Compared as strings so 1 and "1" do not read as a change, which is how
    // ids and numbers arrive from a form.
    if (String(from ?? "") === String(to ?? "")) continue;
    changes[key] = { from: forLog(from), to: forLog(to) };
  }
  return changes;
}

/** "title, category" — for a message that names what moved without repeating the values. */
export function describeChanges(changes: FieldChanges): string {
  return Object.keys(changes).join(", ");
}
