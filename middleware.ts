import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Uses the edge-safe config directly (no @/auth, no mysql2 driver) — this
// file runs on the Edge runtime, which can't load the Node MySQL driver.
const { auth } = NextAuth(authConfig);

const PUBLIC_ACCOUNT_PATHS = ["/account/sign-in", "/account/sign-up"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAccountRoute = pathname.startsWith("/account");
  const isPublicAccountPath = PUBLIC_ACCOUNT_PATHS.some((p) => pathname.startsWith(p));

  if (isAccountRoute && !isPublicAccountPath && !req.auth) {
    const signInUrl = new URL("/account/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/account/:path*"],
};
