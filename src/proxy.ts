import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { SESSION_COOKIE_NAME } from "@/features/auth/session/constants";

const intlMiddleware = createMiddleware(routing);

const KNOWN_LOCALES = routing.locales as readonly string[];

/** Second path segments that require an authenticated session. */
const PROTECTED_SEGMENTS = ["profile", "checkout", "payment"];

/** Replicates the committed intl-middleware matcher exclusions. */
function isBypassPath(pathname: string): boolean {
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/trpc/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_vercel/")
  ) {
    return true;
  }
  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.includes(".");
}

/**
 * Next 16 proxy — three ordered concerns:
 *
 * 1. `/api/v1/*` — translates the httpOnly session cookie into a Bearer
 *    request header for the proxied backend.
 * 2. Locale-prefixed pages — cookie-presence route guards:
 *    - authenticated users never land on the auth page (`?redirect=`
 *      destination honored);
 *    - logged-out users never land on protected pages (redirected to the
 *      auth route with an unprefixed `redirect` param).
 * 3. Everything else — next-intl locale routing (restored: `/` → default
 *    locale, unprefixed URLs → prefixed, NEXT_LOCALE cookie management).
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/v1")) {
    return apiBridge(request);
  }

  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  const parts = pathname.split("/");
  const localeSegment = parts[1];
  const routeSegment = parts[2];

  if (KNOWN_LOCALES.includes(localeSegment)) {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

    if (routeSegment === "auth" && hasSession) {
      const target = safeInternalTarget(request.nextUrl.searchParams.get("redirect"));
      return NextResponse.redirect(new URL(`/${localeSegment}${target}`, request.url));
    }

    if (PROTECTED_SEGMENTS.includes(routeSegment) && !hasSession) {
      const returnTo = encodeURIComponent(
        pathname.replace(/^\/[^/]+/, "") + request.nextUrl.search,
      );
      return NextResponse.redirect(
        new URL(`/${localeSegment}/auth?redirect=${returnTo}`, request.url),
      );
    }
  }

  return intlMiddleware(request);
}

function apiBridge(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return NextResponse.next({ request: { headers } });
}

function safeInternalTarget(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  if (value.startsWith("/auth")) return "";
  return value;
}

export const config = {
  matcher: "/((?!trpc|_next|_vercel|.*\\..*).*)",
};
