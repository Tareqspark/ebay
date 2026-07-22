import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, adminUsers } from "@/db/schema";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;
        const normalizedEmail = email.toLowerCase();

        // Staff accounts (admin_users) are checked first, then customer
        // accounts (users) — the two are entirely separate identities, kept
        // in separate tables, so no email collision handling is needed.
        const [staff] = await db.select().from(adminUsers).where(eq(adminUsers.email, normalizedEmail)).limit(1);
        if (staff && staff.status === "active") {
          const valid = await compare(password, staff.passwordHash);
          if (valid) {
            return { id: staff.id, name: staff.name, email: staff.email, isAdmin: true, adminRole: staff.role };
          }
        }

        const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
        if (!user) return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, isAdmin: false };
      },
    }),
  ],
});
