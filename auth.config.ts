import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the auth config — no providers, no DB import. Used by
 * middleware.ts (which runs on the Edge runtime, where the mysql2 driver
 * used by @/db cannot load). The full config in auth.ts spreads this and
 * adds the Credentials provider for everywhere else (Server Components,
 * Server Actions, the /api/auth route) that runs on the Node runtime.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/account/sign-in",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};
