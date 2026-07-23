import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Uses the edge-safe config directly (no @/auth, no mysql2 driver) — this
// file runs on the Edge runtime, which can't load the Node MySQL driver.
const { auth } = NextAuth(authConfig);

const PUBLIC_ACCOUNT_PATHS = ["/account/sign-in", "/account/sign-up"];

/**
 * Nonce-based CSP, following Next.js's own documented pattern: the nonce is
 * forwarded to the framework via the x-nonce request header, which Next.js
 * reads during rendering and applies automatically to its own inline
 * hydration scripts — verified after deploy by checking those scripts'
 * nonce= attribute matches the header (see the PR description / commit
 * message for the exact curl-based check, since this can't be verified in
 * a real browser in this environment). 'strict-dynamic' lets any script
 * the nonced bootstrap script loads (Stripe.js) run without needing every
 * such origin individually allowlisted; the explicit https://js.stripe.com
 * entries are the fallback for browsers that don't support strict-dynamic.
 */
function buildCsp(nonce: string): string {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://picsum.photos https://fastly.picsum.photos;
    font-src 'self' data:;
    connect-src 'self' https://api.stripe.com;
    frame-src https://js.stripe.com https://hooks.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), usb=(), midi=()");
  // Browsers only honor this over an actual HTTPS connection, so it's a
  // no-op (not a risk) in local HTTP dev.
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  return response;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // btoa(), not Buffer — this runs on the Edge runtime, where Buffer isn't
  // guaranteed to exist; btoa is a standard Web API available there.
  const nonce = btoa(crypto.randomUUID());

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  // Read by app/admin/(dashboard)/layout.tsx to resolve the current section's
  // required permission — middleware is the only place a Server Component
  // can reliably learn the request path today (no direct equivalent of
  // usePathname() on the server).
  requestHeaders.set("x-pathname", pathname);

  const isAccountRoute = pathname.startsWith("/account");
  const isPublicAccountPath = PUBLIC_ACCOUNT_PATHS.some((p) => pathname.startsWith(p));

  if (isAccountRoute && !isPublicAccountPath && !req.auth) {
    const signInUrl = new URL("/account/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(signInUrl), nonce);
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
    return applySecurityHeaders(NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 }), nonce);
  }

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (isAdminRoute && !req.auth?.user?.isAdmin) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl), nonce);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return applySecurityHeaders(response, nonce);
});

export const config = {
  // Runs on (almost) every request now, not just /account and /admin —
  // security headers belong on every response, not a subset of routes.
  // Static assets are excluded since they're not HTML and don't need CSP.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
