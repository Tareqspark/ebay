import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
      adminRole?: string;
    } & DefaultSession["user"];
  }
}

// next-auth's `User` type is a re-export of @auth/core/types's `User`, not a
// fresh interface declared in the "next-auth" module — augmenting it there
// merges into a type alias, not the real interface, so authorize()'s return
// type (and the `user` param in the jwt() callback) never picks it up. This
// is the module that actually needs augmenting.
declare module "@auth/core/types" {
  interface User {
    isAdmin?: boolean;
    adminRole?: string;
  }
}

// Same re-export situation as User above — next-auth/jwt's JWT type is a
// re-export of @auth/core/jwt's JWT, which is what the jwt()/session()
// callback params are actually typed against.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    adminRole?: string;
  }
}
