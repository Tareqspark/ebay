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

  // /api/admin/* has no page to redirect to and is consumed by fetch(),
  // not navigation — a JSON 401 rather than a redirect to /admin/login,
  // which a fetch() would otherwise follow and choke on parsing as JSON.
  // This is the only thing standing between these routes and an
  // unauthenticated caller: none of the route handlers check the session
  // themselves (confirmed via QA — every one of them returned real data,
  // including full customer PII and order history, with zero cookies).
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  if (isAdminApiRoute && !req.auth?.user?.isAdmin) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (isAdminRoute && !req.auth?.user?.isAdmin) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/api/admin/:path*"],
};
