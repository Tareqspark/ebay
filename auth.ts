import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, adminUsers } from "@/db/schema";
import { authConfig } from "@/auth.config";
import { isRateLimited, recordAttempt, getClientIp } from "@/lib/rate-limit";

// Both staff and customer logins go through this one authorize() callback,
// so it's the single choke point for brute-force protection across the
// whole app. Two layers: per-account (stops repeated guessing against one
// email regardless of source) and per-IP (stops one source spraying
// guesses across many different accounts). Only failed attempts count —
// a correct password on the first try never touches either counter.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_EMAIL = 5;
const MAX_ATTEMPTS_PER_IP = 20;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;
        const normalizedEmail = email.toLowerCase();

        const ip = getClientIp(request.headers);
        const emailKey = `login:email:${normalizedEmail}`;
        const ipKey = `login:ip:${ip}`;

        // Checked before touching the DB at all — a locked-out attempt
        // returns null the same way a wrong password does (no distinct
        // "you're rate limited" message), so this can't be used to probe
        // which accounts exist or how close they are to lockout.
        if (isRateLimited(emailKey, MAX_ATTEMPTS_PER_EMAIL, LOGIN_WINDOW_MS) || isRateLimited(ipKey, MAX_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS)) {
          return null;
        }

        function recordFailure() {
          recordAttempt(emailKey, LOGIN_WINDOW_MS);
          recordAttempt(ipKey, LOGIN_WINDOW_MS);
        }

        // Staff accounts (admin_users) are checked first, then customer
        // accounts (users) — the two are entirely separate identities, kept
        // in separate tables, so no email collision handling is needed.
        const [staff] = await db.select().from(adminUsers).where(eq(adminUsers.email, normalizedEmail)).limit(1);
        if (staff && staff.status === "active") {
          const valid = await compare(password, staff.passwordHash);
          if (valid) {
            return { id: staff.id, name: staff.name, email: staff.email, isAdmin: true, adminRole: staff.role };
          }
          recordFailure();
          return null;
        }

        const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
        if (!user) {
          recordFailure();
          return null;
        }

        const valid = await compare(password, user.passwordHash);
        if (!valid) {
          recordFailure();
          return null;
        }

        return { id: user.id, name: user.name, email: user.email, isAdmin: false };
      },
    }),
  ],
});
